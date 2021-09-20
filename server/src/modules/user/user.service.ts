import { getOfficerDisplayName } from './user.util'
import { User as UserModel, Tag as TagModel } from '../../bootstrap/sequelize'
import { User } from '../../models'
import { LoadUserDto } from '~shared/types/api'

export class UserService {
  createOfficer = async (username: string): Promise<User> => {
    return UserModel.create({
      username,
      displayname: getOfficerDisplayName(username),
    })
  }

  loadUser = async (userId: number): Promise<LoadUserDto> => {
    return UserModel.findByPk(userId, {
      include: TagModel,
    }) as Promise<LoadUserDto>
  }
}
