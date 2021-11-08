import Sequelize, { ProjectionAlias } from 'sequelize'
import {
  Agency,
  Post,
  Tag,
  User,
  PostStatus,
  TagType,
} from '~shared/types/base'
import { ModelDef } from '../../types/sequelize'
import { PostCreation } from '../../models/posts.model'
import { countBy, uniqBy } from 'lodash'
import { PostWithUserTopicTagRelations } from '../post/post.service'

export class TagsService {
  private Agency: ModelDef<Agency>
  private Post: ModelDef<Post, PostCreation>
  private Tag: ModelDef<Tag>
  private User: ModelDef<User>

  constructor({
    Agency,
    Post,
    Tag,
    User,
  }: {
    Agency: ModelDef<Agency>
    Post: ModelDef<Post, PostCreation>
    Tag: ModelDef<Tag>
    User: ModelDef<User>
  }) {
    this.Agency = Agency
    this.Post = Post
    this.Tag = Tag
    this.User = User
  }

  private postsCountLiteral: ProjectionAlias = [
    Sequelize.literal(`(
      SELECT COUNT(DISTINCT postId)
      FROM posttags
      WHERE tagId = tag.id
    )`),
    'postsCount',
  ]

  /**
   * List all tags in the descending order of number of posts with them
   * @returns list of tags
   */
  listTags = async (): Promise<Tag[]> => {
    const tags = await this.Tag.findAll({
      attributes: [
        'id',
        'tagname',
        'description',
        'link',
        'hasPilot',
        'createdAt',
        'tagType',
        this.postsCountLiteral,
      ],
      order: [[Sequelize.literal('postsCount'), 'DESC']],
    })
    return tags
  }

  /**
   * Lists all tags that user is allowed to tag a post with in the following order:
   * 1) Agency tags that user is allowed to add
   * 2) Topic tags that user is allowed to add in descending order
   *    of number of occurrences in existing posts
   *
   * @param userId id of the user
   * @returns list of tags
   */
  listTagsUsedByUser = async (userId: number): Promise<Tag[]> => {
    const userAgencyTags = await this.Tag.findAll({
      where: {
        tagType: TagType.Agency,
      },
      include: {
        model: this.User,
        where: { id: userId },
      },
    })

    const agencyNames = userAgencyTags.map((agencyTag) => agencyTag.tagname)

    const postsWithAgencyTags = await this.Post.findAll({
      where: {
        status: PostStatus.Public,
      },
      include: {
        model: this.Tag,
        where: {
          tagname: agencyNames,
        },
      },
    })

    const postIds = postsWithAgencyTags.map((post) => post.id)

    const posts = (await this.Post.findAll({
      where: { id: postIds },
      include: this.Tag,
    })) as PostWithUserTopicTagRelations[]

    const existingTopicTags = posts.reduce<Tag[]>(
      (acc, post) => acc.concat(post.tags),
      [],
    )

    const countTopicTags = countBy<Tag>(existingTopicTags, (tag) => tag.id)

    const allowedTopicTags = await this.Tag.findAll({
      where: {
        tagType: TagType.Topic,
      },
      include: {
        model: this.User,
        where: { id: userId },
      },
    })

    const orderedTopicTags = allowedTopicTags.sort(
      (first, second) =>
        (countTopicTags[second.id] || 0) - (countTopicTags[first.id] || 0),
    )

    const combinedTags = [...userAgencyTags, ...orderedTopicTags]

    return combinedTags
  }

  /**
   * List all tags that have appeared in a post with the agency tag
   * If there is no posts with both the agency tag and topic tag,
   * topic tag will not be shown even if the tag belongs to the agency.
   * @param agencyId id of agency
   * @returns list of tags
   */
  listTagsUsedByAgency = async (agencyId: number): Promise<Tag[]> => {
    const agency = await this.Agency.findByPk(agencyId)
    // If agency is not found, there are no tags used by it
    if (!agency) return []

    const postsWithAgencyTag = await this.Post.findAll({
      where: {
        // TODO: clarify whether we need to get Posts that have been deleted/archived
        status: PostStatus.Public,
      },
      include: {
        model: this.Tag,
        where: { tagname: agency.shortname },
      },
    })

    const postIds = postsWithAgencyTag.map((post) => post.id)

    const posts = (await this.Post.findAll({
      where: { id: postIds },
      include: this.Tag,
    })) as PostWithUserTopicTagRelations[]

    const combinedTags = posts.reduce<Tag[]>(
      (acc, post) => acc.concat(post.tags),
      [],
    )

    return uniqBy<Tag>(combinedTags, (tag: Tag) => tag.id)
  }

  /**
   * Get a single tag by name
   * @param tagName name of tag
   * @returns tag
   */
  getSingleTag = async (tagName: string): Promise<Tag> => {
    const tag = await this.Tag.findOne({
      where: { tagname: tagName },
      attributes: [
        'id',
        'tagname',
        'description',
        'createdAt',
        this.postsCountLiteral,
      ],
    })
    if (!tag) {
      throw new Error('Tag not found')
    } else {
      return tag
    }
  }
}
