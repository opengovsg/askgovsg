import convict, { Schema } from 'convict'
import { baseConfig, Environment } from './base'

export type AuthConfig = {
  sessionSecret: string
  govEmailGlob: string
}

const authSchema: Schema<AuthConfig> = {
  sessionSecret: {
    doc: 'Session secret',
    format: String,
    default: '',
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

export const callbackRedirectURL =
  baseConfig.nodeEnv === Environment.Dev
    ? 'http://localhost:3000'
    : 'https://staging.ask.gov.sg'

export const callbackRedirectUnauthorisedURL =
  baseConfig.nodeEnv === Environment.Dev
    ? 'http://localhost:3000/unauthorised'
    : 'https://staging.ask.gov.sg/unauthorised'
