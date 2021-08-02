import { inspect } from 'util'
import { format } from 'winston'

/**
 * A custom formatter for winston. Transforms winston's info object into a
 * string representation, mainly used for console logging.
 */
export const formatLogMessage = format.printf((info) => {
  // Handle multiple arguments passed into logger
  // e.g. logger.info('param1', 'param2')
  // The second parameter onwards will be passed into the `splat` key and
  // require formatting (because that is just how the library is written).
  const splatSymbol = Symbol.for('splat') as unknown as string
  const splatArgs = info[splatSymbol] || []
  const rest = splatArgs
    .map((data: unknown) => formatWithInspect(data))
    .join(' ')
  return `${info.timestamp} ${info.level} [${info.label}]: ${formatWithInspect(
    info.message,
  )}\t${rest}`
})

const isPrimitive = (val: unknown): boolean => {
  return val === null || (typeof val !== 'object' && typeof val !== 'function')
}

/**
 * Formats a log message for readability.
 * Adapted from
 * https://github.com/winstonjs/winston/issues/1427#issuecomment-583199496
 */
const formatWithInspect = (val: unknown): string => {
  // We have a custom method for printing errors, so ignore errors here
  if (val instanceof Error) {
    return ''
  }
  const formattedVal =
    typeof val === 'string' ? val : inspect(val, { depth: null, colors: true })

  return isPrimitive(val) ? formattedVal : `\n${formattedVal}`
}
