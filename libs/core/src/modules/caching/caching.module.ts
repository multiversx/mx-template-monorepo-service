import { CacheModule, Module } from '@nestjs/common';
import { ConfigApiModule } from '../config-api';
import { MultiversXApiModule } from '../multiversx-api';
import { CachingService } from './caching.service';

@Module({
  imports: [CacheModule.register(), ConfigApiModule, MultiversXApiModule],
  providers: [CachingService],
  exports: [CachingService],
})
export class CachingModule {}
