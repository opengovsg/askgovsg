import express from 'express'
import passport from 'passport'
import { localStrategy } from './local.strategy'
import { Token, User } from '../../models'
import { ModelCtor } from 'sequelize'

export const passportConfig = (
  app: express.Application,
  Token: ModelCtor<Token>,
  User: ModelCtor<User>,
): void => {
  localStrategy(Token, User)
  app.use(passport.initialize())
  app.use(passport.session())
  // stores user to session
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // retrieves user from session
  passport.deserializeUser((id: number, done) => {
    const user = { id }
    done(null, user)
  })
}
