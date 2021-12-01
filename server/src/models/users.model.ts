import { Sequelize, DataTypes, Model, ModelCtor } from 'sequelize'

import { IMinimatch } from 'minimatch'
import { User as UserBaseDto } from '~shared/types/base'

const USER_MODEL_NAME = 'user'

// TODO (#225): Remove this and replace ModelCtor below with ModelDefined
export interface User extends Model, UserBaseDto {}

interface Settable {
  setDataValue(key: string, value: unknown): void
}

// constructor
export const defineUser = (
  sequelize: Sequelize,
  { emailValidator }: { emailValidator: IMinimatch },
): { User: ModelCtor<User> } => {
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

  return { User }
}
