import convict, { Schema } from 'convict'
import { url } from 'convict-format-with-validator'

convict.addFormat(url)

export type SearchConfig = {
  host: string
  username: string
  password: string
  port: number
}

const searchSchema: Schema<SearchConfig> = {
  host: {
    doc: 'Host for opensearch service',
    format: String,
    default: 'localhost',
    env: 'SEARCH_HOST',
  },
  username: {
    doc: 'Username for opensearch service',
    format: String,
    default: 'admin',
    env: 'SEARCH_USERNAME',
  },
  password: {
    doc: 'Password for opensearch service',
    format: String,
    default: 'admin',
    env: 'SEARCH_PASSWORD',
  },
  port: {
    doc: 'Port for opensearch service',
    format: 'port',
    default: 9200,
    env: 'SEARCH_PORT',
  },
}

export const searchConfig = convict(searchSchema)
  .validate({ allowed: 'strict' })
  .getProperties()
