import { Sequelize, DataTypes, Model, ModelCtor } from 'sequelize'

import { IMinimatch } from 'minimatch'
import { PublicUser as PublicUserBaseDto } from '~shared/types/base'

const PUBLIC_USER_MODEL_NAME = 'publicuser'

export interface PublicUser extends Model, PublicUserBaseDto {}

interface Settable {
  setDataValue(key: string, value: unknown): void
}

// constructor
export const definePublicUser = (
  sequelize: Sequelize,
  { emailValidator }: { emailValidator: IMinimatch },
): { PublicUser: ModelCtor<PublicUser> } => {
  const PublicUser: ModelCtor<PublicUser> = sequelize.define(
    PUBLIC_USER_MODEL_NAME,
    {
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isEmail: true,
          isLowercase: true,
          is: emailValidator.makeRe(),
        },
        set(this: Settable, email: string) {
          // save email as lowercase for ease of checks
          this.setDataValue('email', email.trim().toLowerCase())
        },
      },
      sgid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      displayname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
  )

  return { PublicUser }
}
