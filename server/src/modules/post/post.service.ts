import { SortType } from '../../types/sort-type'

import Sequelize, { OrderItem, Op } from 'sequelize'
import { PostStatus } from '../../types/post-status'
import helperFunction from '../../helpers/helperFunction'

import {
  User as UserModel,
  Tag as TagModel,
  PostTag as PostTagModel,
  Post as PostModel,
  Answer as AnswerModel,
} from '../../bootstrap/sequelize'
import { HelperResult } from '../../types/response-handler'
import { Post, Tag } from '../../models'
import { PostEditType } from '../../types/post-type'
import { PostWithRelations as PostWithUserRelations } from '../auth/auth.service'

export type UserWithRelations = {
  getTags: () => Tag[]
}

export type PostWithRelations = Post & {
  countAnswers: () => number
  tags: Tag[]
}

export class PostService {
  private sortFunction = (sortType: SortType): OrderItem => {
    if (sortType === SortType.Basic) {
      return ['createdAt', 'DESC']
    }
    return ['views', 'DESC']
  }

  listAnswerablePosts = async ({
    userId,
    sort,
    withAnswers,
    tags,
  }: {
    userId: string
    sort: SortType
    withAnswers: boolean
    tags?: string[]
  }): Promise<HelperResult> => {
    const user = (await UserModel.findOne({
      where: { id: userId },
    })) as UserWithRelations | null
    if (!user) {
      // throw new Error('Unable to find user with given ID')
      return [
        helperFunction.responseHandler(
          false,
          404,
          'Unable to find user with given ID',
          null,
        ),
        null,
      ]
    }

    const tagInstances = await user.getTags()
    const tagIds = tagInstances.map((t) => t.id)

    const postTagInstances = await PostTagModel.findAll({
      where: { tagId: tagIds },
    })
    const postIds = postTagInstances.map((p) => p.postId)

    const posts = (await PostModel.findAll({
      where: {
        id: postIds,
        status: { [Op.ne]: PostStatus.ARCHIVED },
        ...(tags ? { '$tags.tagname$': tags } : {}),
      },
      order: [this.sortFunction(sort)],
      include: [TagModel, { model: AnswerModel, required: withAnswers }],
    })) as PostWithRelations[]

    // Duplicate of logic from retrieveAll
    // TODO: Optimize to merge the 2 requests into one
    // Two queries used as when I search for specific tags, the response
    // will only return tags which are matching, not all tags associated
    // with a question

    // get only the IDs we need via filtering
    const postsToMap =
      tags && tags.length > 0
        ? // filter posts further to contain ALL of the wanted tags from ANY of the tags
          // since posts are already filtered for ANY of the wanted tags
          // sufficient to filter posts that contain the same number of tags as wanted tags
          posts.filter((posts) => posts.tags.length == tags.length)
        : posts
    const filteredPostIds = postsToMap.map(({ id }) => id)

    const returnPosts = await PostModel.findAll({
      where: { id: filteredPostIds },
      order: [this.sortFunction(sort)],
      include: [
        {
          model: TagModel,
          required: true,
          attributes: ['tagname', 'description', 'tagType'],
        },
        { model: UserModel, required: true, attributes: ['username'] },
        AnswerModel,
      ],
      attributes: [
        'id',
        'userId',
        'title',
        'description',
        'createdAt',
        'views',
        [
          Sequelize.literal(`(
            SELECT COUNT(DISTINCT answers.id)
            FROM answers 
            WHERE answers.postId = post.id
          )`),
          'answer_count',
        ],
      ],
    })

    if (!posts) {
      return [
        helperFunction.responseHandler(false, 404, 'No posts found', null),
        null,
      ]
    } else if (withAnswers) {
      return [
        null,
        helperFunction.responseHandler(true, 200, 'Success', returnPosts),
      ]
    } else {
      // posts without answers
      return this.filterPostsWithoutAnswers(posts)
    }
  }

  filterPostsWithoutAnswers = async (
    data?: PostWithRelations[],
  ): Promise<HelperResult> => {
    if (!data) {
      return [
        helperFunction.responseHandler(false, 404, 'No posts found', null),
        null,
      ]
    } else {
      const answerPromises = data.map((p) => p.countAnswers())
      const answerCounts = await Promise.all(answerPromises)
      return [
        null,
        helperFunction.responseHandler(
          true,
          200,
          'Posts',
          data.filter((_, index) => answerCounts[index] === 0),
        ),
      ]
    }
  }

  getTopPosts = async (): Promise<Post[]> => {
    const posts = await PostModel.findAll({
      include: [TagModel],
      order: [['views', 'DESC']],
      attributes: [
        'id',
        'userId',
        'title',
        'description',
        'createdAt',
        'views',
        [
          Sequelize.literal(`(
          SELECT COUNT(*)
          FROM answers AS answer
          WHERE
            answer.postId = post.id
        )`),
          'answer_count',
        ],
      ],
      where: { status: PostStatus.PUBLIC },
    })
    if (!posts) {
      return []
    } else {
      return posts
    }
  }

  checkOneAgency = (arr: Tag[]): boolean => {
    return arr.some((e) => e.tagType === 'AGENCY')
  }

  getExistingTagsFromRequestTags = async (
    tagNames: string[],
  ): Promise<Tag[]> => {
    const existingTags = await TagModel.findAll({
      where: { tagname: tagNames },
    })
    return existingTags
  }

  // migrated from posts.model
  createPostWithTag = async (newPost: {
    title: string
    description: string
    userId: string
    tagname: string[]
  }): Promise<string> => {
    const tagList = await this.getExistingTagsFromRequestTags(newPost.tagname)

    if (newPost.tagname.length !== tagList.length) {
      throw 'At least one tag does not exist'
    } else {
      // check if at least one agency tag exists
      if (!this.checkOneAgency(tagList)) {
        throw 'At least one tag must be an agency tag'
      }
      // Only create post if tag exists
      const post = await PostModel.create({
        title: newPost.title,
        description: newPost.description,
        userId: newPost.userId,
        status: PostStatus.PRIVATE,
      })
      for (const tag of tagList) {
        // Create a posttag for each tag
        await PostTagModel.create({
          postId: post.id,
          tagId: tag.id,
        })
      }
      return post.id
    }
  }

  remove = async (id: string): Promise<HelperResult> => {
    const update = await PostModel.update(
      { status: 'ARCHIVED' },
      { where: { id: id } },
    )
    if (!update) {
      return [
        helperFunction.responseHandler(false, 400, 'Update failed', null),
        null,
      ]
    } else {
      return [
        null,
        helperFunction.responseHandler(true, 200, 'Post Removed', null),
      ]
    }
  }

  update = async ({
    id,
    tagname,
    description,
    title,
  }: PostEditType): Promise<boolean> => {
    await PostModel.update({ title, description }, { where: { id: id } })

    const tagList = await this.getExistingTagsFromRequestTags(tagname)

    // easier way is to delete anything of the postId and recreate
    // of course calculating the changes would be the way to go
    await PostTagModel.destroy({ where: { postId: id } })

    let updated

    for (const tag of tagList) {
      // Create a posttag for each tag
      updated = await PostTagModel.create({
        postId: id,
        tagId: tag.id,
      })
    }

    if (updated) {
      return true
    }
    return false
  }

  retrieveOne = async (postId: string): Promise<PostWithUserRelations> => {
    await PostModel.increment(
      {
        views: +1,
      },
      {
        where: {
          id: postId,
        },
      },
    )

    const post = (await PostModel.findOne({
      where: {
        id: postId,
      },
      include: [TagModel, { model: UserModel, attributes: ['displayname'] }],
      attributes: [
        'id',
        'userId',
        'title',
        'description',
        'createdAt',
        'views',
        'status',
        [
          Sequelize.literal(`(
                SELECT COUNT(*)
                FROM answers AS answer
                WHERE answer.postId = post.id
              )`),
          'answer_count',
        ],
      ],
    })) as PostWithUserRelations

    if (!post) {
      throw 'No post with this id'
    } else {
      return post
    }
  }

  retrieveAll = async ({
    sort,
    tags,
  }: {
    sort: SortType
    tags: string
  }): Promise<Post[]> => {
    // basic
    let tags_unchecked: string[] = []

    if (tags) {
      tags_unchecked = tags.split(',')
    }

    // returns length of tags that are valid in DB
    const tagList = await this.getExistingTagsFromRequestTags(tags_unchecked)
    // convert back to raw tags in array form
    const rawTags = tagList.map((element) => element.tagname)

    // prevent search if query is invalid
    if (tagList.length != tags_unchecked.length) {
      throw 'Invalid tags used in request'
    }

    const whereobj = {
      status: PostStatus.PUBLIC,
      ...(tagList.length ? { '$tags.tagname$': rawTags } : {}),
    }

    const orderarray = this.sortFunction(sort)

    // OR search and retrieve IDs of the respective posts
    const posts = (await PostModel.findAll({
      where: whereobj,
      order: [orderarray],
      include: [
        {
          model: TagModel,
          required: true,
          attributes: ['tagname', 'description'],
        },
        { model: UserModel, required: true, attributes: ['username'] },
        AnswerModel,
      ],
      attributes: ['id'],
    })) as PostWithRelations[]

    if (!posts) {
      return []
    } else {
      // TODO: Optimize to merge the 2 requests into one
      // Two queries used as when I search for specific tags, the response
      // will only return tags which are matching, not all tags associated
      // with a question

      // get only the IDs we need via filtering
      let id_array = []
      if (tagList.length > 0) {
        const filterPosts = posts.filter(
          (e) => e.tags.length == tagList.length || !tagList.length,
        )
        // store IDs in an array
        id_array = filterPosts.map((element) => element.id)
      } else {
        id_array = posts.map((element) => element.id)
      }
      // get posts based on id, displaying all properties
      const returnPosts = await PostModel.findAll({
        where: { id: id_array },
        order: [orderarray],
        include: [
          {
            model: TagModel,
            required: true,
            attributes: ['tagname', 'description', 'tagType'],
          },
          { model: UserModel, required: true, attributes: ['username'] },
          AnswerModel,
        ],
        attributes: [
          'id',
          'userId',
          'title',
          'description',
          'createdAt',
          'views',
          [
            Sequelize.literal(`(
            SELECT COUNT(DISTINCT answers.id)
            FROM answers 
            WHERE answers.postId = post.id
          )`),
            'answer_count',
          ],
        ],
      })
      return returnPosts
    }
  }
}
