import { getOfficerDisplayName } from './user.util'
import { User as UserModel, Tag as TagModel } from '../../bootstrap/sequelize'
import { User } from '../../models'

export class UserService {
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
