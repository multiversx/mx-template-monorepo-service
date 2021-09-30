import { Injectable, Logger } from '@nestjs/common';
import { MetricsService } from '../metrics';
import axios from 'axios';
import { PerformanceProfiler } from '../../utils/performance.profiler';
import { ConfigApiService } from '../config-api';

@Injectable()
export class ElrondApiService {
  private readonly logger: Logger;
  private readonly baseUrl: string;

  constructor(
    private readonly configApiService: ConfigApiService,
    private readonly metricsService: MetricsService,
  ) {
    this.baseUrl = this.configApiService.getElrondApiUrl();
    this.logger = new Logger(ElrondApiService.name);
  }

  async get(url: string): Promise<any> {
    const profiler = new PerformanceProfiler();

    try {
      return await axios.get(`${this.baseUrl}${url}`);
    } catch (error: any) {
      this.logger.error({
        method: 'GET',
        path: url,
        response: error.response.data,
        status: error.response.status,
      });

      throw error;
    } finally {
      profiler.stop();
      this.metricsService.setExternalCall(
        this.getHostname(url),
        profiler.duration,
      );
    }
  }

  async post(url: string, data: any): Promise<any> {
    const profiler = new PerformanceProfiler();
    try {
      const result = await axios.post(`${this.baseUrl}${url}`, data);

      return result.data;
    } catch (error: any) {
      this.logger.error({
        method: 'POST',
        url,
        response: error.response.data,
        status: error.response.status,
      });

      throw error;
    } finally {
      profiler.stop();
      this.metricsService.setExternalCall(
        this.getHostname(url),
        profiler.duration,
      );
    }
  }

  async head(url: string): Promise<any> {
    const profiler = new PerformanceProfiler();

    try {
      return await axios.head(`${this.baseUrl}${url}`);
    } catch (error: any) {
      this.logger.error({
        method: 'HEAD',
        url,
        response: error.response?.data,
        status: error.response?.status,
      });

      throw error;
    } finally {
      profiler.stop();
      this.metricsService.setExternalCall(
        this.getHostname(url),
        profiler.duration,
      );
    }
  }

  private getHostname(url: string): string {
    return new URL(url).hostname;
  }
}
