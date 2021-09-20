import { User as UserModel, Tag as TagModel } from '../../bootstrap/sequelize'
import { LoadUserDto } from '~shared/types/api'

export class UserService {
  loadUser = async (userId: number): Promise<LoadUserDto> => {
    return UserModel.findByPk(userId, {
      include: TagModel,
    }) as Promise<LoadUserDto>
  }
}
