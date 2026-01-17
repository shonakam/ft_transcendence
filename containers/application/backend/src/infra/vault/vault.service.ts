import * as https from 'https';
import * as vaultModule from 'node-vault';

// Handle both ESM and CommonJS module formats
const vault = (vaultModule as any).default || vaultModule;

// 允许自签名证书（开发/评测环境）
const agent = new https.Agent({ rejectUnauthorized: false });

export interface JwtSecrets {
  access_secret: string;
  refresh_secret: string;
  tmp_auth_secret: string;
}

export interface OAuthCredentials {
  client_id: string;
  client_secret: string;
}

export class VaultService {
  private vaultClient: any;
  private isConnected: boolean = false;

  constructor() {
    this.vaultClient = vault({
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ENDPOINT || 'https://vault:8200',
      token: process.env.VAULT_TOKEN || '',
      requestOptions: { agent },
    });
  }

  /**
   * Initialize and check connection to Vault
   */
  async init(): Promise<boolean> {
    try {
      await this.vaultClient.health();
      this.isConnected = true;
      console.log('Vault: Connection established successfully (HTTPS).');
      return true;
    } catch (err) {
      this.isConnected = false;
      console.error(
        'Vault: Initialization failed. Please ensure the Vault container is running and unsealed.',
      );
      return false;
    }
  }

  /**
   * Check if Vault is connected
   */
  isAvailable(): boolean {
    return this.isConnected;
  }

  /**
   * Save secret data to a specific path (KV v2)
   */
  async setSecret(path: string, data: Record<string, any>) {
    try {
      // KV v2 uses secret/data/ prefix
      const kvPath = path.startsWith('secret/data/')
        ? path
        : `secret/data/${path}`;
      return await this.vaultClient.write(kvPath, { data });
    } catch (err) {
      throw new Error(`Vault Write Error: Could not save secret to ${path}`);
    }
  }

  /**
   * Read secret data from a specific path (KV v2)
   */
  async getSecret(path: string): Promise<Record<string, any> | null> {
    try {
      const kvPath = path.startsWith('secret/data/')
        ? path
        : `secret/data/${path}`;
      const response = await this.vaultClient.read(kvPath);
      return response?.data?.data || null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Delete secret data from a specific path
   */
  async deleteSecret(path: string) {
    try {
      const kvPath = path.startsWith('secret/data/')
        ? path
        : `secret/data/${path}`;
      await this.vaultClient.delete(kvPath);
    } catch (err) {
      console.error(`Vault Delete Error at ${path}:`, err);
    }
  }

  // ============================================
  // Convenience methods for specific secrets
  // ============================================

  /**
   * Get JWT secrets from Vault
   * Falls back to environment variables if Vault is unavailable
   */
  async getJwtSecrets(): Promise<JwtSecrets> {
    if (this.isConnected) {
      const secrets = await this.getSecret('backend/jwt');
      if (secrets) {
        console.log('Vault: ✅ JWT secrets loaded from Vault');
        return {
          access_secret: secrets.access_secret,
          refresh_secret: secrets.refresh_secret,
          tmp_auth_secret: secrets.tmp_auth_secret,
        };
      }
    }
    // Fallback to environment variables
    console.warn('⚠️  Vault: JWT secrets NOT loaded from Vault - using environment variables (INSECURE for production!)');
    return {
      access_secret: process.env.JWT_ACCESS_SECRET || '',
      refresh_secret: process.env.JWT_REFRESH_SECRET || '',
      tmp_auth_secret: process.env.JWT_TMP_AUTH_SECRET || '',
    };
  }

  /**
   * Get OAuth credentials from Vault
   * Falls back to environment variables if Vault is unavailable
   */
  async getOAuthCredentials(): Promise<OAuthCredentials> {
    if (this.isConnected) {
      const secrets = await this.getSecret('backend/oauth');
      if (secrets) {
        console.log('Vault: ✅ OAuth credentials loaded from Vault');
        return {
          client_id: secrets.client_id,
          client_secret: secrets.client_secret,
        };
      }
    }
    // Fallback to environment variables
    console.warn(
      'Vault: OAuth credentials not found in Vault, using environment variables',
    );
    return {
      client_id: process.env.VITE_42_CLIENT_ID || '',
      client_secret: process.env.VITE_42_CLIENT_SECRET || '',
    };
  }

  /**
   * Get cookie secret from Vault
   */
  async getCookieSecret(): Promise<string> {
    if (this.isConnected) {
      const secrets = await this.getSecret('backend/cookie');
      if (secrets?.secret) {
        console.log('Vault: ✅ Cookie secret loaded from Vault');
        return secrets.secret;
      }
    }
    console.warn('⚠️  Vault: Cookie secret NOT loaded from Vault - using environment variable');
    return process.env.COOKIE_SECRET || '';
  }
}
