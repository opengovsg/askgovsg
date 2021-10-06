import { DataTypes, Sequelize } from 'sequelize'
import { Agency, User } from '~shared/types/base'
import { ModelDef } from '../types/sequelize'

// constructor
export const defineAgency = (
  sequelize: Sequelize,
  { User }: { User: ModelDef<User> },
): ModelDef<Agency> => {
  const Agency: ModelDef<Agency> = sequelize.define('agency', {
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
    website: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Enforces a display order for categories
    // belonging to an agency
    displayOrder: {
      type: DataTypes.JSON,
      validate: {
        isArray: true,
      },
      allowNull: true,
    },
  })
  // Define associations for Agency
  Agency.hasMany(User)
  User.belongsTo(Agency)
  return Agency
}
