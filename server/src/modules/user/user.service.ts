import { LoadUserDto } from '~shared/types/api'
import { Tag, User } from '~shared/types/base'
import { ModelDef } from '../../types/sequelize'
import { getOfficerDisplayName } from './user.util'

export class UserService {
  private User: ModelDef<User, Pick<User, 'username' | 'displayname'>>
  private Tag: ModelDef<Tag>
  constructor({
    User,
    Tag,
  }: {
    User: ModelDef<User, Pick<User, 'username' | 'displayname'>>
    Tag: ModelDef<Tag>
  }) {
    this.User = User
    this.Tag = Tag
  }
  createOfficer = async (username: string): Promise<User> => {
    return this.User.create({
      username,
      displayname: getOfficerDisplayName(username),
    })
  }

  loadUser = async (userId: number): Promise<LoadUserDto> => {
    return this.User.findByPk(userId, {
      include: this.Tag,
    }) as Promise<LoadUserDto>
  }
}
