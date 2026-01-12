import { Module, Global } from '@nestjs/common';
import { VaultService } from './vault.service';

@Global() // Make VaultService available everywhere in the app
@Module({
  providers: [VaultService],
  exports: [VaultService],
})
export class VaultModule {}
