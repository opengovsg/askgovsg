import convict, { Schema } from 'convict'

export type RecaptchaConfig = {
  recaptchaSecretKey: string
}

const recaptchaSchema: Schema<RecaptchaConfig> = {
  recaptchaSecretKey: {
    doc: 'Recaptcha key for server to verify user response',
    format: String,
    default: '',
    env: 'RECAPTCHA_SECRET_KEY',
    sensitive: true,
  },
}

export const recaptchaConfig = convict(recaptchaSchema)
  .validate({ allowed: 'strict' })
  .getProperties()
