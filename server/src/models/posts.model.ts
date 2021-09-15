import { Sequelize, DataTypes, Model, ModelCtor } from 'sequelize'

import { User } from './users.model'
import { Tag } from './tags.model'
import { Post as PostBaseDto, PostStatus } from '~shared/types/base'

// TODO (#225): Remove this and replace ModelCtor below with ModelDefined
export interface Post extends Model, PostBaseDto {}

export interface PostTag extends Model {
  postId: number
  tagId: number
}

// constructor
export const definePostAndPostTag = (
  sequelize: Sequelize,
  { User, Tag }: { User: ModelCtor<User>; Tag: ModelCtor<Tag> },
): { Post: ModelCtor<Post>; PostTag: ModelCtor<PostTag> } => {
  const Post: ModelCtor<Post> = sequelize.define('post', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(
        PostStatus.Public,
        PostStatus.Private,
        PostStatus.Archived,
      ),
      allowNull: false,
    },
  })

  const PostTag: ModelCtor<PostTag> = sequelize.define('posttag', {})

  // Define associations for Post
  User.hasMany(Post)
  Post.belongsTo(User)
  Post.belongsToMany(Tag, {
    through: PostTag,
  })
  Tag.belongsToMany(Post, {
    through: PostTag,
  })
  return { Post, PostTag }
}
