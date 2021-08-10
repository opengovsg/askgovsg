import convict, { Schema } from 'convict'

export enum Environment {
  Prod = 'production',
  Dev = 'development',
  Test = 'test',
}

export type BaseConfig = {
  nodeEnv: Environment
  serverPort: number
  logoHost: string
}

const baseSchema: Schema<BaseConfig> = {
  nodeEnv: {
    doc: 'Express environment mode',
    format: Object.values(Environment),
    default: Environment.Prod,
    env: 'NODE_ENV',
  },
  serverPort: {
    doc: 'Application port',
    format: 'port',
    default: 5000,
    env: 'SERVER_PORT',
  },
  logoHost: {
    doc: 'Host for agency logo images',
    format: String,
    default: 'https://s3-ap-southeast-1.amazonaws.com/',
    env: 'LOGOS_HOST',
  },
}

export const baseConfig = convict(baseSchema)
  .validate({ allowed: 'strict' })
  .getProperties()
