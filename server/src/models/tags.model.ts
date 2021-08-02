import { Sequelize, DataTypes, Model, ModelCtor } from 'sequelize'

import { TagType } from '../types/tag-type'

export interface Tag extends Model {
  id: string
  tagname: string
  description: string
  link: string
  hasPilot: boolean
  tagType: string
}

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
      type: DataTypes.ENUM(TagType.AGENCY, TagType.TOPIC),
      allowNull: false,
    },
  })

export default defineTag
