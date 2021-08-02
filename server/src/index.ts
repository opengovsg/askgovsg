import { app, sequelize as sequelizeInstance } from './bootstrap'
import { baseConfig, Environment } from './bootstrap/config/base'
import { createLogger } from './bootstrap/logging'

// port initialized
const PORT = baseConfig.serverPort

const logger = createLogger(module)

;(async () => {
  if (baseConfig.nodeEnv !== Environment.Prod) {
    await sequelizeInstance.sync({ force: false })
  }

  app.listen(PORT, () =>
    logger.info({
      message: `Server started`,
      meta: { function: 'init', port: PORT },
    }),
  )
})()
