import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import * as vault from 'node-vault';

@Injectable()
export class VaultService implements OnModuleInit {
  private vaultClient: vault.client;

  constructor() {
    this.vaultClient = vault({
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ENDPOINT || 'http://vault:8200',
      token: process.env.VAULT_TOKEN || 'root',
    });
  }

  /**
   * Initialize and check connection to Vault
   */
  async onModuleInit() {
    try {
      await this.vaultClient.health();
      console.log('Vault: Connection established successfully.');
    } catch (err) {
      // Vaultが起動していない場合にエラーを表示
      console.error('Vault: Initialization failed. Please ensure the Vault container is running.');
    }
  }

  /**
   * Save secret data to a specific path
   * @param path e.g., 'secret/data/mfa/user-1'
   * @param data Object to be stored
   */
  async setSecret(path: string, data: Record<string, any>) {
    try {
      return await this.vaultClient.write(path, data);
    } catch (err) {
      throw new InternalServerErrorException('Vault Write Error: Could not save secret');
    }
  }

  /**
   * Read secret data from a specific path
   */
  async getSecret(path: string) {
    try {
      const response = await this.vaultClient.read(path);
      return response.data;
    } catch (err) {
      // データの取得に失敗した場合やパスが存在しない場合は null を返す
      return null;
    }
  }
}
