export interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
  account_id: string
  uid: string
  refresh_token?: string
}
