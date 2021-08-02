import { Sequelize, DataTypes, Model, ModelCtor } from 'sequelize'

import { User } from './users.model'

export interface Agency extends Model {
  shortname: string
  longname: string
  email: string
  logo: string
}

// constructor
export const defineAgency = (
  sequelize: Sequelize,
  { User }: { User: ModelCtor<User> },
): ModelCtor<Agency> => {
  const Agency: ModelCtor<Agency> = sequelize.define('agency', {
    shortname: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    longname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
  })
  // Define associations for Agency
  Agency.hasMany(User)
  User.belongsTo(Agency)
  return Agency
}
