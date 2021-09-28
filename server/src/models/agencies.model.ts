import { Sequelize, DataTypes, Model, ModelCtor } from 'sequelize'
import { Agency as AgencyBaseDto } from '~shared/types/base'
import { User } from './users.model'

export interface Agency extends Model, AgencyBaseDto {}

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
    noEnquiriesMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  })
  // Define associations for Agency
  Agency.hasMany(User)
  User.belongsTo(Agency)
  return Agency
}
