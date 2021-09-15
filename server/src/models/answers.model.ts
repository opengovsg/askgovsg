import { Sequelize, DataTypes, Model, ModelCtor } from 'sequelize'
import { Answer as AnswerBaseDto } from '../../../shared/types/base'
import { User } from './users.model'
import { Post } from './posts.model'

// TODO (#225): Remove this and replace ModelCtor below with ModelDefined
export interface Answer extends Model, AnswerBaseDto {}

// constructor
export const defineAnswer = (
  sequelize: Sequelize,
  { User, Post }: { User: ModelCtor<User>; Post: ModelCtor<Post> },
): ModelCtor<Answer> => {
  const Answer: ModelCtor<Answer> = sequelize.define('answer', {
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  })

  // Define associations for Answer
  User.hasMany(Answer)
  Answer.belongsTo(User)
  Post.hasMany(Answer)
  Answer.belongsTo(Post)

  return Answer
}
