import { Sequelize, DataTypes, Model, ModelCtor } from 'sequelize'
import { Tag as TagBaseDto, TagType } from '../../../shared/types/base'

export interface Tag extends Model, TagBaseDto {}

// constructor
export const defineTag = (sequelize: Sequelize): ModelCtor<Tag> =>
  sequelize.define('tag', {
    tagname: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hasPilot: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    tagType: {
      type: DataTypes.ENUM(...Object.values(TagType)),
      allowNull: false,
    },
  })

export default defineTag
