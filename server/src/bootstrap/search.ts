import { Client } from '@opensearch-project/opensearch'
import fs from 'fs'
import { baseConfig, Environment } from './config/base'
import { searchConfig } from './config/search'

const searchHost = searchConfig.host
const protocol = 'https'
const port = searchConfig.port
const auth = `${searchConfig.username}:${encodeURIComponent(
  searchConfig.password,
)}`

const ssl =
  baseConfig.nodeEnv === Environment.Dev
    ? // Turn off certificate verification (rejectUnauthorized: false)
      // if we are running in a dev environment
      { rejectUnauthorized: false }
    : // Otherwise, set the path to CA certificate for Alpine Linux,
      // the OS that AskGov runs on
      { ca: fs.readFileSync('/etc/ssl/cert.pem') }

export const searchClient = new Client({
  node: protocol + '://' + auth + '@' + searchHost + ':' + port,
  ssl,
})

export default searchClient
