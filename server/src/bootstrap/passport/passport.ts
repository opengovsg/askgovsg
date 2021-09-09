import express from 'express'
import passport from 'passport'
import { localStrategy } from './local.strategy'

const passportConfig = (app: express.Application): void => {
  localStrategy()
  app.use(passport.initialize())
  app.use(passport.session())
  // stores user to session
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // retrieves user from session
  passport.deserializeUser((id: string, done) => {
    const user = { id }
    done(null, user)
  })
}

export default passportConfig
