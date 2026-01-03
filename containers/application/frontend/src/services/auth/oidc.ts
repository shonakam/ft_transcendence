import { api } from '../../lib/httpClient'

export interface  OidcResponse {
  accessToken: string | null
  refreshToken: string | null
}

export async function oidc(param: string, code: string): Promise<OidcResponse> {
	return api.post<OidcResponse>(`auth/login/oidc/${param}`, code)
}
