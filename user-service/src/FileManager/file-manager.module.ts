import { Global, Module } from '@nestjs/common';
import { FileManagerService } from './file-manager.service';

@Global()
@Module({
  providers: [FileManagerService],
  exports: [FileManagerService],
})
export class FileManagerModule {}
