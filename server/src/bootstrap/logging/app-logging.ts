import path from 'path'
import { SPLAT } from 'triple-beam'
import { format, Logger, LoggerOptions, loggers, transports } from 'winston'
import { baseConfig, Environment } from '../config/base'
import { formatLogMessage } from './helpers'

/**
 * Create a new winston logger with given module
 * @param callingModule the module to create a logger for
 */
export const createLogger = (callingModule: NodeModule) => {
  const label = getModuleLabel(callingModule)
  loggers.add(label, createLoggerOptions(label))
  return createCustomLogger(loggers.get(label))
}

/**
 * Creates a log label based on the filename of a Node module
 * @param callingModule Node module to be labelled
 * @returns Label
 */
const getModuleLabel = (callingModule: NodeModule): string => {
  // Remove the file extension from the filename and split with path separator.
  const parts = callingModule.filename.replace(/\.[^/.]+$/, '').split(path.sep)
  // Join the last two parts of the file path together.
  return path.join(parts[parts.length - 2], parts.pop() ?? '')
}

/**
 * Creates logger options for use by winston.
 * @param label The label of the logger
 * @returns the created options
 */
export const createLoggerOptions = (label: string): LoggerOptions => {
  return {
    level: 'debug',
    format: format.combine(
      format.errors({ stack: true }),
      format.label({ label }),
      format.timestamp(),
      errorHunter(),
      baseConfig.nodeEnv === Environment.Prod
        ? format.json({ replacer: jsonErrorReplacer })
        : format.combine(format.colorize(), errorPrinter(), formatLogMessage),
    ),
    transports: [
      new transports.Console({
        silent: baseConfig.nodeEnv === Environment.Test,
      }),
    ],
    exitOnError: false,
  }
}

/**
 * Type of object passed to logger. We wrap Winston's logger methods
 * in a custom function which forces consumers to log in this shape.
 */
type CustomLoggerParams = {
  message: string
  meta: {
    // Name of logging function
    function: string
    [other: string]: unknown
  }
  error?: unknown
}

/**
 * Overrides the given winston logger with a new signature, so as to enforce a
 * log format.
 * @param logger the logger to override
 */
export const createCustomLogger = (logger: Logger) => {
  return {
    info: (params: Omit<CustomLoggerParams, 'error'>) => {
      const { message, meta } = params
      return logger.info(message, { meta })
    },
    warn: (params: CustomLoggerParams) => {
      const { message, meta, error } = params
      if (error) {
        return logger.warn(message, { meta }, error)
      }
      return logger.warn(message, { meta })
    },
    error: (params: CustomLoggerParams) => {
      const { message, meta, error } = params
      if (error) {
        return logger.error(message, { meta }, error)
      }
      return logger.error(message, { meta })
    },
  }
}

/**
 * Formats the error in the transformable info to a console.error-like format.
 */
const errorPrinter = format((info) => {
  if (!info.error) return info

  // Handle case where Error has no stack.
  const errorMsg = info.error.stack || info.error.toString()
  info.message += `\n${errorMsg}`

  return info
})

/**
 * Hunts for errors in the given object passed to the logger.
 * Assigns the `error` key the found error.
 */
const errorHunter = format((info) => {
  if (info.error) return info

  // The SPLAT symbol is a key which contains additional arguments
  // passed to the logger. Hence search that array for any instances
  // of errors.
  const splat = info[SPLAT as any] || []
  info.error = splat.find((obj: any) => obj instanceof Error)

  return info
})

/**
 * This is required as JSON.stringify(new Error()) returns an empty object. This
 * function converts the error in `info.error` into a readable JSON stack trace.
 *
 * Function courtesy of
 * https://github.com/winstonjs/winston/issues/1243#issuecomment-463548194.
 */
const jsonErrorReplacer = (_key: string, value: unknown) => {
  if (value instanceof Error) {
    return Object.getOwnPropertyNames(value).reduce((all, valKey) => {
      if (valKey === 'stack') {
        const errStack = value.stack ?? ''
        return {
          ...all,
          at: errStack
            .split('\n')
            .filter((va) => va.trim().slice(0, 5) !== 'Error')
            .map((va, i) => `stack ${i} ${va.trim()}`),
        }
      } else {
        return {
          ...all,
          [valKey]: value[valKey as keyof Error],
        }
      }
    }, {})
  } else {
    return value
  }
}
