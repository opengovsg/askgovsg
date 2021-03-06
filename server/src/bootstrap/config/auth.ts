import convict, { Schema } from 'convict'

export type AuthConfig = {
  sessionSecret: string
  govEmailGlob: string
}

const authSchema: Schema<AuthConfig> = {
  sessionSecret: {
    doc: 'Session secret',
    format: String,
    default: null,
    env: 'SESSION_SECRET',
    sensitive: true,
  },
  govEmailGlob: {
    doc: 'Glob to validate email addresses of government officers',
    format: String,
    default: '*.gov.sg',
    env: 'GOV_EMAIL_GLOB',
  },
}

export const authConfig = convict(authSchema)
  .validate({ allowed: 'strict' })
  .getProperties()
