import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MetricsService } from '..';
import { CachingService } from '../modules/caching/caching.service';

@Injectable()
export class CachingInterceptor implements NestInterceptor {
  private pendingRequestsDictionary: { [key: string]: any } = {};

  constructor(
    private readonly cachingService: CachingService,
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly metricsService: MetricsService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const apiFunction =
      context.getClass().name + '.' + context.getHandler().name;

    const cacheKey = this.getCacheKey(context);
    if (cacheKey) {
      const pendingRequest = this.pendingRequestsDictionary[cacheKey];
      if (pendingRequest) {
        const result = await pendingRequest;
        this.metricsService.incrementPendingApiHit(apiFunction);
        return of(result);
      }

      const cachedValue = await this.cachingService.getCacheLocal(cacheKey);
      if (cachedValue) {
        this.metricsService.incrementCachedApiHit(apiFunction);
        return of(cachedValue);
      }

      let pendingRequestResolver: (value: unknown) => void;
      let pendingRequestReject: (value: unknown) => void;
      this.pendingRequestsDictionary[cacheKey] = new Promise(
        (resolve, reject) => {
          pendingRequestResolver = resolve;
          pendingRequestReject = reject;
        },
      );

      return next.handle().pipe(
        tap(async (result) => {
          delete this.pendingRequestsDictionary[cacheKey ?? ''];
          pendingRequestResolver(result);

          const ttl =
            await this.cachingService.getSecondsRemainingUntilNextRound();

          await this.cachingService.setCacheLocal(cacheKey ?? '', result, ttl);
        }),
        catchError((err) => {
          delete this.pendingRequestsDictionary[cacheKey ?? ''];
          pendingRequestReject(err);

          return throwError(err);
        }),
      );
    }

    return next.handle();
  }

  getCacheKey(context: ExecutionContext): string | undefined {
    const httpAdapter = this.httpAdapterHost.httpAdapter;

    const request = context.getArgByIndex(0);
    if (httpAdapter.getRequestMethod(request) !== 'GET') {
      return undefined;
    }

    return httpAdapter.getRequestUrl(request);
  }
}
