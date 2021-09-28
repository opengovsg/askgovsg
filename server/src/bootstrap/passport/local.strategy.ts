import passport from 'passport'
import passportLocal from 'passport-local'
import { ModelCtor } from 'sequelize/types'
import { Token, User } from '../../models'
import { verifyHash } from '../../util/hash'
const LocalStrategy = passportLocal.Strategy

export const localStrategy = (
  Token: ModelCtor<Token>,
  User: ModelCtor<User>,
): void => {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'otp' },
      async (email, otp, done) => {
        try {
          const token = await Token.findOne({ where: { contact: email } })
          if (!token) {
            return done(null, false, { message: 'No OTP sent for this user.' })
          }
          const verifyHashResult = await verifyHash(otp, token.hashedOtp)
          if (!verifyHashResult) {
            return done(null, false, {
              message: 'OTP is invalid. Please try again.',
            })
          }
          const user = await User.findOne({ where: { username: email } })
          if (!user) {
            return done(null, false, {
              message: 'No user exists with this email',
            })
          }
          await Token.destroy({ where: { contact: email } })
          return done(null, user)
        } catch (error) {
          return done(error)
        }
      },
    ),
  )
}
