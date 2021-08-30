import { Model, ModelCtor, Sequelize } from 'sequelize'
import { emailValidator } from '../bootstrap/email-validator'
import {
  defineAgency,
  defineAnswer,
  definePostAndPostTag,
  defineTag,
  defineToken,
  defineUserAndPermission,
} from '../models'

export enum ModelName {
  Answer = 'answer',
  Agency = 'agency',
  Post = 'post',
  PostTag = 'posttag',
  Tag = 'tag',
  User = 'user',
  Permission = 'permission',
  Token = 'token',
}

/**
 * Connect to a in-memory database
 */
export const createTestDatabase = async (): Promise<Sequelize> => {
  const sequelize = new Sequelize('sqlite::memory:', { logging: false })

  const Token = defineToken(sequelize)
  const Tag = defineTag(sequelize)
  const { User, Permission } = defineUserAndPermission(sequelize, {
    Tag,
    emailValidator,
  })
  const Agency = defineAgency(sequelize, { User })
  const { Post, PostTag } = definePostAndPostTag(sequelize, {
    User,
    Tag,
  })
  const Answer = defineAnswer(sequelize, { User, Post })

  await sequelize.sync()

  return sequelize
}

export function getModel<T extends Model>(
  sequelize: Sequelize,
  modelName: ModelName,
): ModelCtor<T> {
  return sequelize.models[modelName] as ModelCtor<T>
}
