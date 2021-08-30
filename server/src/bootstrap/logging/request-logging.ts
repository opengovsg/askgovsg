import expressWinston from 'express-winston'
import { StatusCodes } from 'http-status-codes'
import { format, transports } from 'winston'
import { baseConfig, Environment } from '../config/base'
import { formatLogMessage } from './helpers'

export const requestLoggingMiddleware = expressWinston.logger({
  transports: [new transports.Console()],
  format: format.combine(
    // Label as 'network' to differentiate from application logs
    format.label({ label: 'network' }),
    format.timestamp(),
    baseConfig.nodeEnv === Environment.Prod
      ? format.json()
      : format.combine(format.colorize(), formatLogMessage),
  ),
  // Removes the string "HTTP" which is otherwise redundantly added to every
  // single log, and also adds the response code
  expressFormat: true,
  // Set dynamic log level according to status codes
  level: function (_req, res) {
    if (res.statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) return 'error'
    if (res.statusCode >= StatusCodes.BAD_REQUEST) return 'warn'
    return 'info'
  },
  dynamicMeta: (req, res) => ({
    clientIp: req.get('cf-connecting-ip') ?? req.ip,
    contentLength: res.get('content-length'),
  }),
  headerBlacklist: ['cookie'],
  skip: (req, _res) => {
    // Skip if it's ELB-HealthChecker to avoid polluting logs
    const userAgent = req.get('user-agent') || ''
    return userAgent.startsWith('ELB-HealthChecker')
  },
})
