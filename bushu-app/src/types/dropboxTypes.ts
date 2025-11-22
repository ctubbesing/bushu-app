import * as z from 'zod'

export const TokenResponse = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
  scope: z.string().optional(),
  account_id: z.string().optional(),
  uid: z.string().optional(),
  refresh_token: z.string().optional(),
})
export type TokenResponse = z.infer<typeof TokenResponse>

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

export const AppSettings = z.object({
  widgetList: z.array(z.string()),
})
export type AppSettings = z.infer<typeof AppSettings>
