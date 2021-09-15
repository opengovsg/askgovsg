import convict, { Schema } from 'convict'
import { readFileSync } from 'fs'

function getInstanceId() {
  let instanceId = 'i-unknown'
  try {
    // Find the instance id as described in files commonly
    // found in cloud-init hosts, including EC2 instances
    instanceId = readFileSync('/var/lib/cloud/data/instance-id', 'utf-8')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  } finally {
    // For safety, interpolate into another string and trim whitespace
    return `${instanceId}`.trim()
  }
}

export enum DatadogEnv {
  Staging = 'staging',
  Production = 'production',
}

export type DataDogConfig = {
  apiKey: string
  hostname: string
  env: DatadogEnv
  service: string
}

const datadogSchema: Schema<DataDogConfig> = {
  apiKey: {
    doc: 'Datadog API Key',
    format: String,
    default: 'nogoodkey',
    env: 'DD_API_KEY',
    sensitive: true,
  },
  hostname: {
    doc: 'Hostname reported to Datadog',
    format: String,
    default: getInstanceId(),
    env: 'DD_HOSTNAME',
  },
  env: {
    doc: 'Express environment mode',
    format: Object.values(DatadogEnv),
    default: DatadogEnv.Production,
    env: 'DATADOG_ENV',
  },
  service: {
    doc: 'Name of service as reported to Datadog',
    format: String,
    default: 'askgovsg',
  },
}

export const datadogConfig = convict(datadogSchema)
  .validate({ allowed: 'strict' })
  .getProperties()
