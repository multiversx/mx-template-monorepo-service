import { CacheModule, Module } from '@nestjs/common';
import { ConfigApiModule } from '../config-api';
import { ElrondApiModule } from '../elrond-api';
import { CachingService } from './caching.service';

@Module({
  imports: [CacheModule.register(), ConfigApiModule, ElrondApiModule],
  providers: [CachingService],
  exports: [CachingService],
})
export class CachingModule {}
