export interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  scope?: string
  account_id?: string
  uid?: string
  refresh_token?: string
}

export interface DBAccountInfo {
  account_id: string
  account_type: { '.tag': string }
  country: string
  disabled: boolean
  email: string
  email_verified: boolean
  is_paired: boolean
  locale: string
  name: {
    abbreviated_name: string
    display_name: string
    familiar_name: string
    given_name: string
    surname: string
  }
  profile_photo_url: string
  referral_link: string
  root_info: {
    '.tag': string
    home_namespace_id: string
    root_namespace_id: string
  }
}

export interface AppSettings {
  widgetList: string[]
}