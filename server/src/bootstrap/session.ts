import init from 'connect-session-sequelize'
import { RequestHandler } from 'express'
import session, { SessionOptions } from 'express-session'
import { Sequelize } from 'sequelize/types'
import { authConfig } from './config/auth'
import { baseConfig, Environment } from './config/base'

const isDev =
  baseConfig.nodeEnv === Environment.Dev ||
  baseConfig.nodeEnv === Environment.Test

// Cookie settings needed for express-session configuration
const cookieSettings: SessionOptions['cookie'] = {
  secure: !isDev, // true prevents cookie from being accessed over http
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  sameSite: 'strict', // Cookie will not be sent if navigating from another domain
}

const sessionMiddleware = (db: Sequelize): RequestHandler => {
  // Connect to Sequelize
  const SequelizeStore = init(session.Store)
  const sequelizeStore = new SequelizeStore({
    db: db,
  })
  // Configure express-session
  const expressSession = session({
    saveUninitialized: false,
    resave: false,
    secret: authConfig.sessionSecret,
    cookie: cookieSettings,
    name: 'connect.sid',
    store: sequelizeStore,
  })

  return expressSession
}

export default sessionMiddleware
