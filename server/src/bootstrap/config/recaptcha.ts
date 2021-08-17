import convict, { Schema } from 'convict'

export type RecaptchaConfig = {
  recaptchaSiteKey: string
  recaptchaSecretKey: string
}

const recaptchaSchema: Schema<RecaptchaConfig> = {
  recaptchaSiteKey: {
    doc: 'Recaptcha key for client to generate user response',
    format: String,
    default: null,
    env: 'REACT_APP_RECAPTCHA_SITE_KEY',
  },
  recaptchaSecretKey: {
    doc: 'Recaptcha key for server to verify user response',
    format: String,
    default: null,
    env: 'RECAPTCHA_SECRET_KEY',
    sensitive: true,
  },
}

export const recaptchaConfig = convict(recaptchaSchema)
  .validate({ allowed: 'strict' })
  .getProperties()
