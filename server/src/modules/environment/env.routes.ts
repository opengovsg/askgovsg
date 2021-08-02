import express from 'express'
import { EnvController } from './env.controller'

export const routeEnv = ({
  controller,
}: {
  controller: EnvController
}): express.Router => {
  const router = express.Router()

  router.get('/', controller.getEnvironmentVars)
  return router
}
