import { HttpClient } from "../http/client.ts";
import { IdP42Service } from "./42.ts";

export class IdP {
  static get42(client: HttpClient) { return new IdP42Service(client) }
  static getGitHub(client: HttpClient) {}
  static getGoogle(client: HttpClient) {}  

  public static getProviderService(providerName: string, client: HttpClient) {
    switch (providerName.toLowerCase()) {
      case 'ft':
        return this.get42(client);
      case 'github':
        return this.getGitHub(client);
      case 'google':
        return this.getGoogle(client);
      default:
        throw new Error(`Unsupported IDP provider: ${providerName}`);
    }
  }
}
