import { api } from "../../lib/httpClient"

export interface SetupTOTPResponse {
  uri: string
}

export async function setupMfa(): Promise<SetupTOTPResponse> {
	return api.get<SetupTOTPResponse>('auth/setup-mfa/totp')
}
