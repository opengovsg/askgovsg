import { Sequelize } from 'sequelize'

import {
  defineAgency,
  defineAnswer,
  definePostAndPostTag,
  defineTag,
  defineToken,
  defineUserAndPermission,
  defineTopic,
} from '../models'
import { dbConfig } from './config/database'

import { emailValidator } from './email-validator'

export const sequelize = new Sequelize({ ...dbConfig, logging: false })

export const Token = defineToken(sequelize)
export const Tag = defineTag(sequelize)
export const { User, Permission } = defineUserAndPermission(sequelize, {
  Tag,
  emailValidator,
})
export const Agency = defineAgency(sequelize, { User })
export const Topic = defineTopic(sequelize, { Agency })
export const { Post, PostTag } = definePostAndPostTag(sequelize, {
  Agency,
  User,
  Tag,
  Topic,
})
export const Answer = defineAnswer(sequelize, { User, Post })

export default sequelize
