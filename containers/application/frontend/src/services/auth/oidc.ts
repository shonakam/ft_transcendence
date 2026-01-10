import { api } from '../../lib/httpClient';

export interface OidcRequest {
  code: string;
}

export interface OidcResponse {
  accessToken: string | null;
  refreshToken: string | null;
  tmpAuthToken: string | null;
}

export function oidcRequestForm(code: string): OidcRequest {
  return { code: code } as OidcRequest;
}

export async function oidc(
  param: string,
  data: OidcRequest
): Promise<OidcResponse> {
  return api.post<OidcResponse>(`auth/login/oidc/${param}`, data);
}
