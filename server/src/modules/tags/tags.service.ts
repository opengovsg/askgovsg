import Sequelize, { ProjectionAlias } from 'sequelize'
import {
  Agency as AgencyModel,
  Post as PostModel,
  Tag as TagModel,
  User as UserModel,
} from '../../bootstrap/sequelize'
import { PostStatus } from '../../../../shared/types/base'
import { countBy, uniqBy } from 'lodash'
import { Tag } from '../../models'
import { PostWithUserTagRelations } from '../post/post.service'
import { TagType } from '../../types/tag-type'

export class TagsService {
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
    const tags = await TagModel.findAll({
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
    if (!tags) {
      return []
    } else {
      return tags
    }
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
        status: PostStatus.Public,
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
    })) as PostWithUserTagRelations[]

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

  /**
   * List all tags that have appeared in a post with the agency tag
   * If there is no posts with both the agency tag and topic tag,
   * topic tag will not be shown even if the tag belongs to the agency.
   * @param agencyId id of agency
   * @returns list of tags
   */
  listTagsUsedByAgency = async (agencyId: number): Promise<Tag[]> => {
    const agency = await AgencyModel.findByPk(agencyId)
    // If agency is not found, there are no tags used by it
    if (!agency) return []

    const postsWithAgencyTag = await PostModel.findAll({
      where: {
        // TODO: clarify whether we need to get Posts that have been deleted/archived
        status: PostStatus.Public,
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
    })) as PostWithUserTagRelations[]

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
    const tag = await TagModel.findOne({
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
