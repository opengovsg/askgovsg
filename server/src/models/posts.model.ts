import { DataTypes, Sequelize } from 'sequelize'
import { Agency, Post, PostStatus, Tag, Topic, User } from '~shared/types/base'
import { Creation, ModelDef } from '../types/sequelize'

export interface PostTag {
  postId: number
  tagId: number
}

// We explicitly make views optional because Sequelize
// is lacking in its type support such that it blindly takes your
// creation attributes as canonical, not inferring defaults as optional
export type PostCreation = Creation<
  Omit<Post, 'views'> & {
    views?: number
  }
>

// constructor
export const definePostAndPostTag = (
  sequelize: Sequelize,
  {
    User,
    Agency,
    Tag,
    Topic,
  }: {
    User: ModelDef<User>
    Agency: ModelDef<Agency>
    Tag: ModelDef<Tag>
    Topic: ModelDef<Topic>
  },
): { Post: ModelDef<Post, PostCreation>; PostTag: ModelDef<PostTag> } => {
  const Post: ModelDef<Post, PostCreation> = sequelize.define('post', {
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

  // Silence tsc errors since we will be adding the relevant
  // foreign key relations to PostTag later on
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const PostTag: ModelDef<PostTag> = sequelize.define('posttag', {})

  // Define associations for Post
  User.hasMany(Post)
  Post.belongsTo(User)
  Agency.hasMany(Post)
  Post.belongsTo(Agency)
  Topic.hasMany(Post)
  Post.belongsTo(Topic)
  Post.belongsToMany(Tag, {
    through: PostTag,
  })
  Tag.belongsToMany(Post, {
    through: PostTag,
  })
  return { Post, PostTag }
}
