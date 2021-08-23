import Sequelize from 'sequelize'
import {
  Agency as AgencyModel,
  Post as PostModel,
  Tag as TagModel,
  User as UserModel,
} from '../../bootstrap/sequelize'
import helperFunction from '../../helpers/helperFunction'
import { PostStatus } from '../../types/post-status'
import { HelperResult } from '../../types/response-handler'
import { countBy, uniqBy } from 'lodash'
import { Tag } from '../../models'
import { PostWithRelations } from '../post/post.service'
import { TagType } from '../../types/tag-type'

export class TagsService {
  retrieveAll = async (): Promise<Tag[]> => {
    const tags = await TagModel.findAll({
      group: 'id',
      include: [{ model: PostModel, attributes: ['id'] }],
      attributes: [
        'id',
        'tagname',
        'description',
        'link',
        'hasPilot',
        'createdAt',
        'tagType',
        [
          Sequelize.literal(`(
          SELECT COUNT(DISTINCT posts.id)
          FROM tags
          WHERE postId = tags.id
        )`),
          'posts_count',
        ],
      ],
      order: [[Sequelize.literal('posts_count'), 'DESC']],
    })
    if (!tags) {
      return Array<Tag>()
    } else {
      return tags
    }
  }

  retrieveUsedByAgency = async (agencyId: string): Promise<Tag[]> => {
    const agency = await AgencyModel.findByPk(agencyId)
    // error case if agency is not found
    if (!agency) return []

    const postsWithAgencyTag = await PostModel.findAll({
      where: {
        // TODO: clarify whether we need to get Posts that have been deleted/archived
        status: PostStatus.PUBLIC,
      },
      include: {
        model: TagModel,
        where: { tagname: agency.shortname },
      },
    })

    const postIds = postsWithAgencyTag.map((post) => post.id)

    const posts = (await PostModel.findAll({
      where: { id: postIds },
      include: TagModel,
    })) as PostWithRelations[]

    const combinedTags = posts.reduce<Tag[]>(
      (acc, post) => acc.concat(post.tags),
      [],
    )

    return uniqBy<Tag>(combinedTags, (tag: Tag) => tag.id)
  }

  retrieveOne = async (tagName: string): Promise<Tag> => {
    const tag = await TagModel.findOne({
      where: { tagname: tagName },
      group: 'id',
      include: [{ model: PostModel, attributes: ['id'] }],
      attributes: [
        'id',
        'tagname',
        'description',
        'createdAt',
        [
          Sequelize.literal(`(
          SELECT COUNT(DISTINCT posts.id)
          FROM tags
          WHERE postId = tags.id
        )`),
          'posts_count',
        ],
      ],
      order: [[Sequelize.literal('posts_count'), 'DESC']],
    })
    if (!tag) {
      throw 'Tag not found'
    } else {
      return tag
    }
  }

  /**
   * Gets the list of tags that user is allowed to tag a post with in the following order:
   * 1) Agency tags that user is allowed to add
   * 2) Topic tags that user is allowed to add in descending order
   *    of number of occurrences in existing posts
   *
   * @param userId id of the user
   * @returns list of tags
   */
  retrieveUsedByUser = async (userId: string): Promise<Tag[]> => {
    const userAgencyTags = await TagModel.findAll({
      where: {
        tagType: TagType.AGENCY,
      },
      include: {
        model: UserModel,
        where: { id: userId },
      },
    })

    const agencyNames = userAgencyTags.map((agencyTag) => agencyTag.tagname)

    const postsWithAgencyTags = await PostModel.findAll({
      where: {
        status: PostStatus.PUBLIC,
      },
      include: {
        model: TagModel,
        where: {
          tagname: agencyNames,
        },
      },
    })

    const postIds = postsWithAgencyTags.map((post) => post.id)

    const posts = (await PostModel.findAll({
      where: { id: postIds },
      include: TagModel,
    })) as PostWithRelations[]

    const existingTopicTags = posts.reduce<Tag[]>(
      (acc, post) => acc.concat(post.tags),
      [],
    )

    const countTopicTags = countBy<Tag>(existingTopicTags, (tag) => tag.id)

    const allowedTopicTags = await TagModel.findAll({
      where: {
        tagType: TagType.TOPIC,
      },
      include: {
        model: UserModel,
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
}
