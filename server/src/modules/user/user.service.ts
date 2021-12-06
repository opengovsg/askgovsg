import { LoadUserDto } from '~shared/types/api'
import { Agency, Tag, User } from '~shared/types/base'
import { ModelDef } from '../../types/sequelize'
import { getOfficerDisplayName } from './user.util'

export class UserService {
  private User: ModelDef<User, Pick<User, 'username' | 'displayname'>>
  private Tag: ModelDef<Tag>
  private Agency: ModelDef<Agency>
  constructor({
    User,
    Tag,
    Agency,
  }: {
    User: ModelDef<User, Pick<User, 'username' | 'displayname'>>
    Tag: ModelDef<Tag>
    Agency: ModelDef<Agency>
  }) {
    this.User = User
    this.Tag = Tag
    this.Agency = Agency
  }
  createOfficer = async (username: string): Promise<User> => {
    return this.User.create({
      username,
      displayname: getOfficerDisplayName(username),
    })
  }

  loadUser = async (userId: number): Promise<LoadUserDto> => {
    return this.User.findByPk(userId, {
      include: [this.Agency],
    }) as Promise<LoadUserDto>
  }
}
