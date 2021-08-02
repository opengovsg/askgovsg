import convict, { Schema } from 'convict'
import { url } from 'convict-format-with-validator'

convict.addFormat(url)

export type DbConfig = {
  host: string
  username: string
  password: string
  database: string
  dialect: 'mysql'
}

const dbSchema: Schema<DbConfig> = {
  host: {
    doc: 'Host URL for database connection',
    format: 'url',
    default: null,
    env: 'DB_HOST',
    sensitive: true,
  },
  username: {
    doc: 'Username for database connection',
    format: String,
    default: null,
    env: 'DB_USER',
    sensitive: true,
  },
  password: {
    doc: 'Password for database connection',
    format: String,
    default: null,
    env: 'DB_PASSWORD',
    sensitive: true,
  },
  database: {
    doc: 'Database name',
    format: String,
    default: null,
    env: 'DB_NAME',
  },
  dialect: {
    doc: 'Database dialect',
    format: String,
    default: 'mysql',
  },
}

export const dbConfig = convict(dbSchema)
  .validate({ allowed: 'strict' })
  .getProperties()
