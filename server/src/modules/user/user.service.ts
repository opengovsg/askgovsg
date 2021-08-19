import jwt from 'jsonwebtoken'

import { getOfficerDisplayName } from './user.util'
import { User as UserModel, Tag as TagModel } from '../../bootstrap/sequelize'
import { User } from '../../models'
import { createLogger } from '../../bootstrap/logging'

const logger = createLogger(module)

export class UserService {
  private jwtSecret

  constructor({ jwtSecret }: { jwtSecret: string }) {
    this.jwtSecret = jwtSecret
  }

  login = (userId: string): string => {
    const payload = {
      user: {
        id: userId,
      },
    }
    try {
      return jwt.sign(payload, this.jwtSecret, { expiresIn: 86400 })
    } catch (error) {
      logger.error({
        message: 'Error while signing JWT',
        meta: {
          function: 'login',
        },
        error,
      })
      throw error
    }
  }

  createOfficer = async (username: string): Promise<User> => {
    return UserModel.create({
      username,
      displayname: getOfficerDisplayName(username),
    })
  }

  loadUser = async (userId: string): Promise<User | null> => {
    return UserModel.findByPk(userId, { include: TagModel })
  }
}
