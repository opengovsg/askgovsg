import DatadogWinston from 'datadog-winston'

import { datadogConfig } from '../config/datadog'

export const getDatadogTransport = (): DatadogWinston =>
  new DatadogWinston({
    ...datadogConfig,
    ddtags: `env:${datadogConfig.env}`,
  })
