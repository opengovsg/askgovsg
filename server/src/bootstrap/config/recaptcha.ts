import convict, { Schema } from 'convict'

export type RecaptchaConfig = {
  recaptchaSecretKey: string
  googleRecaptchaURL: string
}

const recaptchaSchema: Schema<RecaptchaConfig> = {
  recaptchaSecretKey: {
    doc: 'Recaptcha key for server to verify user response',
    format: String,
    default: '',
    env: 'RECAPTCHA_SECRET_KEY',
    sensitive: true,
  },
  googleRecaptchaURL: {
    doc: 'URL to verify user response',
    format: String,
    default: 'https://www.google.com/recaptcha/api/siteverify',
  },
}

export const recaptchaConfig = convict(recaptchaSchema)
  .validate({ allowed: 'strict' })
  .getProperties()
