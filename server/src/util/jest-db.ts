import minimatch from 'minimatch'
import { Model, ModelCtor, Sequelize } from 'sequelize'
import { Creation, ModelDef } from '../types/sequelize'
import {
  defineAgency,
  defineAnswer,
  definePostAndPostTag,
  defineTag,
  defineToken,
  defineUser,
  defineTopic,
} from '../models'

export enum ModelName {
  Answer = 'answer',
  Agency = 'agency',
  Post = 'post',
  PostTag = 'posttag',
  Tag = 'tag',
  User = 'user',
  Token = 'token',
  Topic = 'topic',
  PublicUser = 'publicuser',
}

/**
 * Connect to a in-memory database
 */
export const createTestDatabase = async (): Promise<Sequelize> => {
  const sequelize = new Sequelize('sqlite::memory:', { logging: false })
  const emailValidator = new minimatch.Minimatch('*')
  const Token = defineToken(sequelize)
  const Tag = defineTag(sequelize)
  const { User } = defineUser(sequelize, {
    emailValidator,
  })
  const Agency = defineAgency(sequelize, { User })
  const Topic = defineTopic(sequelize, { Agency })
  const { Post, PostTag } = definePostAndPostTag(sequelize, {
    Agency,
    User,
    Tag,
    Topic,
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

export function getModelDef<T, C = Creation<T>>(
  sequelize: Sequelize,
  modelName: ModelName,
): ModelDef<T, C> {
  return sequelize.models[modelName] as ModelDef<T, C>
}
