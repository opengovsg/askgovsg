import { Sequelize, DataTypes, Model, ModelCtor } from 'sequelize'

import { Tag } from './tags.model'
import { IMinimatch } from 'minimatch'
import { PermissionType, User as UserBaseDto } from '../shared/types/base'

const USER_MODEL_NAME = 'user'

// TODO (#225): Remove this and replace ModelCtor below with ModelDefined
export interface User extends Model, UserBaseDto {}

interface Settable {
  setDataValue(key: string, value: unknown): void
}

export interface Permission extends Model {
  role: string
}

// constructor
export const defineUserAndPermission = (
  sequelize: Sequelize,
  { Tag, emailValidator }: { Tag: ModelCtor<Tag>; emailValidator: IMinimatch },
): { User: ModelCtor<User>; Permission: ModelCtor<Permission> } => {
  const User: ModelCtor<User> = sequelize.define(USER_MODEL_NAME, {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        isLowercase: true,
        is: emailValidator.makeRe(),
      },
      set(this: Settable, username: string) {
        // save email as lowercase for ease of checks
        this.setDataValue('username', username.trim().toLowerCase())
      },
    },
    displayname: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  })
  const Permission: ModelCtor<Permission> = sequelize.define('permission', {
    role: {
      type: DataTypes.ENUM(...Object.values(PermissionType)),
      allowNull: false,
    },
  })

  // Define associations

  // Many-to-Many relationships
  // https://sequelize.org/master/manual/advanced-many-to-many.html

  Tag.belongsToMany(User, {
    through: Permission,
  })
  User.belongsToMany(Tag, {
    through: Permission,
  })

  return { User, Permission }
}
