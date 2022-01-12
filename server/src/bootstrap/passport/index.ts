import express from 'express'
import passport from 'passport'
import { localStrategy } from './local.strategy'
import { Token, User, PublicUser } from '../../models'
import { ModelCtor } from 'sequelize'
import { sgidStrategy } from './sgid.strategy'
import { AuthUserDto } from '~shared/types/api'

const privateKeyPem = (process.env.SGID_PRIV_KEY ?? '').replace(/\\n/g, '\n')

export const passportConfig = (
  app: express.Application,
  Token: ModelCtor<Token>,
  User: ModelCtor<User>,
  PublicUser: ModelCtor<PublicUser>,
): void => {
  localStrategy(Token, User)
  sgidStrategy(PublicUser, privateKeyPem)
  app.use(passport.initialize())
  app.use(passport.session())

  // stores user to session
  passport.serializeUser((user, done) => {
    done(null, user)
  })

  // retrieves user from session
  passport.deserializeUser((user: AuthUserDto, done) => {
    done(null, user)
  })
}
