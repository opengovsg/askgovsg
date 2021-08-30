import { app } from './bootstrap'
import { baseConfig } from './bootstrap/config/base'
import { createLogger } from './bootstrap/logging'

// port initialized
const PORT = baseConfig.serverPort

const logger = createLogger(module)

app.listen(PORT, () =>
  logger.info({
    message: `Server started`,
    meta: { function: 'init', port: PORT },
  }),
)
