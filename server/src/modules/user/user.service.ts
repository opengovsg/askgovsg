import jwt from 'jsonwebtoken'

import helperFunction from '../../helpers/helperFunction'
import { getOfficerDisplayName } from './user.util'
import { User as UserModel, Tag as TagModel } from '../../bootstrap/sequelize'
import { User } from '../../models'
import { HelperResult } from '../../types/response-handler'
import { createLogger } from '../../bootstrap/logging'

const logger = createLogger(module)

export class UserService {
  private jwtSecret

  constructor({ jwtSecret }: { jwtSecret: string }) {
    this.jwtSecret = jwtSecret
  }

  login = async (userId: string): Promise<string | undefined> => {
    const payload = {
      user: {
        id: userId,
      },
    }
    return new Promise((resolve, reject) => {
      // TODO: use synchronous jwt.sign
      jwt.sign(
        payload,
        this.jwtSecret,
        { expiresIn: 86400 },
        (error, token) => {
          if (error) {
            logger.error({
              message: 'Error while signing JWT',
              meta: {
                function: 'login',
              },
              error,
            })
            return reject(error)
          }
          return resolve(token)
        },
      )
    })
  }

  createOfficer = async (username: string): Promise<User> => {
    return await UserModel.create({
      username,
      displayname: getOfficerDisplayName(username),
    })
  }

  loadUser = async (userId: string): Promise<HelperResult> => {
    const user = await UserModel.findOne({
      where: {
        id: userId,
      },
      include: TagModel,
    })

    return [null, helperFunction.responseHandler(true, 200, 'Success', user)]
  }
}
