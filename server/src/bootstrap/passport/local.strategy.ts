import passport from 'passport'
import passportLocal from 'passport-local'
import { Token, User } from '../sequelize'
import { verifyHash } from '../../util/hash'
const LocalStrategy = passportLocal.Strategy

export const localStrategy = (): void => {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'otp' },
      async (email, otp, done) => {
        try {
          const token = await Token.findOne({ where: { contact: email } })
          if (!token) {
            return done(null, false, { message: 'Invalid credentials.' })
          }
          const verifyHashResult = await verifyHash(otp, token.hashedOtp)
          if (!verifyHashResult) {
            return done(null, false, { message: 'Invalid credentials.' })
          }
          const user = await User.findOne({ where: { username: email } })
          await Token.destroy({ where: { contact: email } })
          return done(null, user)
        } catch (error) {
          return done(error)
        }
      },
    ),
  )
}
