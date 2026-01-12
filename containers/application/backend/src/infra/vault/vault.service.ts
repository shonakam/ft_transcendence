import * as vault from 'node-vault';

export class VaultService {
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
  async init() {
    try {
      await this.vaultClient.health();
      console.log('Vault: Connection established successfully.');
    } catch (err) {
      console.error('Vault: Initialization failed. Please ensure the Vault container is running.');
    }
  }

  /**
   * Save secret data to a specific path
   */
  async setSecret(path: string, data: Record<string, any>) {
    try {
      return await this.vaultClient.write(path, data);
    } catch (err) {
      // General Error，without NestJS  InternalServerErrorException
      throw new Error('Vault Write Error: Could not save secret');
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
      return null;
    }
  }
}
