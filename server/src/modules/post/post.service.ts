import { SortType } from '../../types/sort-type'

import Sequelize, { OrderItem, Op, ProjectionAlias, ModelCtor } from 'sequelize'
import { Answer, Post, PostTag, Tag, User } from '../../models'
import { PostStatus } from '../../types/post-status'
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
  private Answer: ModelCtor<Answer>
  private Post: ModelCtor<Post>
  private PostTag: ModelCtor<PostTag>
  private Tag: ModelCtor<Tag>
  private User: ModelCtor<User>
  constructor({
    Answer,
    Post,
    PostTag,
    Tag,
    User,
  }: {
    Answer: ModelCtor<Answer>
    Post: ModelCtor<Post>
    PostTag: ModelCtor<PostTag>
    Tag: ModelCtor<Tag>
    User: ModelCtor<User>
  }) {
    this.Answer = Answer
    this.Post = Post
    this.PostTag = PostTag
    this.Tag = Tag
    this.User = User
  }

  private answerCountLiteral: ProjectionAlias = [
    Sequelize.literal(`(
      SELECT COUNT(*)
      FROM answers AS answer
      WHERE
        answer.postId = post.id
    )`),
    'answerCount',
  ]

  private sortFunction = (sortType: SortType): OrderItem => {
    if (sortType === SortType.Basic) {
      return ['createdAt', 'DESC']
    }
    return ['views', 'DESC']
  }

  private filterPostsWithoutAnswers = async (
    data?: PostWithRelations[],
  ): Promise<Post[]> => {
    if (!data) {
      return []
    } else {
      const answerPromises = data.map((p) => p.countAnswers())
      const answerCounts = await Promise.all(answerPromises)
      return data.filter((_, index) => answerCounts[index] === 0)
    }
  }

  private checkOneAgency = (arr: Tag[]): boolean => {
    return arr.some((e) => e.tagType === 'AGENCY')
  }

  getExistingTagsFromRequestTags = async (
    tagNames: string[],
  ): Promise<Tag[]> => {
    const existingTags = await this.Tag.findAll({
      where: { tagname: tagNames },
    })
    return existingTags
  }

  /**
   * Return the paginated posts
   * @param posts post array to be paginated
   * @param page If size is given, specify which page to return
   * @param size Number of posts to return
   * @returns paginated post array and total items in the original array
   */
  private getPaginatedPosts = (
    posts: Post[],
    page?: number,
    size?: number,
  ): {
    posts: Post[]
    totalItems: number
  } => {
    const totalItems = posts.length
    let returnPosts = posts
    if (size) {
      const offset = page ? (page - 1) * size : 0
      returnPosts = returnPosts.slice(offset, Number(offset) + Number(size))
    }
    return {
      posts: returnPosts,
      totalItems: totalItems,
    }
  }

  /**
   * Lists all post
   * @param sort Sort by popularity or recent
   * @param tags Tags to filter by
   * @param size Number of posts to return
   * @param page If size is given, specify which page to return
   */
  listPosts = async ({
    sort,
    tags,
    page,
    size,
  }: {
    sort: SortType
    tags: string
    page?: number
    size?: number
  }): Promise<{
    posts: Post[]
    totalItems: number
  }> => {
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
      throw new Error('Invalid tags used in request')
    }

    const whereobj = {
      status: PostStatus.PUBLIC,
      ...(tagList.length ? { '$tags.tagname$': rawTags } : {}),
    }

    const orderarray = this.sortFunction(sort)

    // OR search and retrieve IDs of the respective posts
    const posts = (await this.Post.findAll({
      where: whereobj,
      order: [orderarray],
      include: [
        {
          model: this.Tag,
          required: true,
          attributes: ['tagname', 'description'],
        },
        { model: this.User, required: true, attributes: ['username'] },
        this.Answer,
      ],
      attributes: ['id'],
    })) as PostWithRelations[]

    if (!posts) {
      return { posts: [], totalItems: 0 }
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
      const returnPosts = await this.Post.findAll({
        where: { id: id_array },
        order: [orderarray],
        include: [
          {
            model: this.Tag,
            required: true,
            attributes: ['tagname', 'description', 'tagType'],
          },
          { model: this.User, required: true, attributes: ['username'] },
          this.Answer,
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
            'answerCount',
          ],
        ],
      })
      return this.getPaginatedPosts(returnPosts, page, size)
    }
  }

  /**
   * Lists all post answerable by the agency user
   * @param userId ID of user
   * @param sort Sort by popularity or recent
   * @param withAnswers If false, show only posts without answers
   * @param tags Tags to filter by
   * @param size Number of posts to return
   * @param page If size is given, specify which page to return
   */
  listAnswerablePosts = async ({
    userId,
    sort,
    withAnswers,
    tags,
    page,
    size,
  }: {
    userId: string
    sort: SortType
    withAnswers: boolean
    tags?: string[]
    page?: number
    size?: number
  }): Promise<{
    posts: Post[]
    totalItems: number
  }> => {
    const user = (await this.User.findOne({
      where: { id: userId },
    })) as UserWithRelations | null
    if (!user) {
      throw new Error('Unable to find user with given ID')
    }

    const tagInstances = await user.getTags()
    const tagIds = tagInstances.map((t) => t.id)

    const postTagInstances = await this.PostTag.findAll({
      where: { tagId: tagIds },
    })
    const postIds = postTagInstances.map((p) => p.postId)

    const posts = (await this.Post.findAll({
      where: {
        id: postIds,
        status: { [Op.ne]: PostStatus.ARCHIVED },
        ...(tags ? { '$tags.tagname$': tags } : {}),
      },
      order: [this.sortFunction(sort)],
      include: [this.Tag, { model: this.Answer, required: withAnswers }],
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

    const returnPosts = await this.Post.findAll({
      where: { id: filteredPostIds },
      order: [this.sortFunction(sort)],
      include: [
        {
          model: this.Tag,
          required: true,
          attributes: ['tagname', 'description', 'tagType'],
        },
        { model: this.User, required: true, attributes: ['username'] },
        this.Answer,
      ],
      attributes: [
        'id',
        'userId',
        'title',
        'description',
        'createdAt',
        'views',
        this.answerCountLiteral,
      ],
    })

    if (!posts) {
      return { posts: [], totalItems: 0 }
    } else if (withAnswers) {
      return this.getPaginatedPosts(returnPosts, page, size)
    } else {
      // posts without answers
      const filteredPosts = await this.filterPostsWithoutAnswers(posts)
      return this.getPaginatedPosts(filteredPosts, page, size)
    }
  }

  /**
   * Get a single post and all the tags and users associated with it
   * @param postId Id of the post
   */
  getSinglePost = async (postId: string): Promise<PostWithUserRelations> => {
    await this.Post.increment(
      {
        views: +1,
      },
      {
        where: {
          id: postId,
        },
      },
    )

    const post = (await this.Post.findOne({
      where: {
        id: postId,
      },
      include: [this.Tag, { model: this.User, attributes: ['displayname'] }],
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
          'answerCount',
        ],
      ],
    })) as PostWithUserRelations

    if (!post) {
      throw new Error('No post with this id')
    } else {
      return post
    }
  }

  /**
   * Create a new post
   * @param newPost Post to be created
   * @returns Id of the new post if it is successfully created
   */
  createPost = async (newPost: {
    title: string
    description: string
    userId: string
    tagname: string[]
  }): Promise<string> => {
    const tagList = await this.getExistingTagsFromRequestTags(newPost.tagname)

    if (newPost.tagname.length !== tagList.length) {
      throw new Error('At least one tag does not exist')
    } else {
      // check if at least one agency tag exists
      if (!this.checkOneAgency(tagList)) {
        throw new Error('At least one tag must be an agency tag')
      }
      // Only create post if tag exists
      const post = await this.Post.create({
        title: newPost.title,
        description: newPost.description,
        userId: newPost.userId,
        status: PostStatus.PRIVATE,
      })
      for (const tag of tagList) {
        // Create a posttag for each tag
        await this.PostTag.create({
          postId: post.id,
          tagId: tag.id,
        })
      }
      return post.id
    }
  }

  /**
   * Delete a post by setting the post to archive
   * @param id Post to be deleted
   * @returns void if successful
   */
  deletePost = async (id: string): Promise<void> => {
    const update = await this.Post.update(
      { status: 'ARCHIVED' },
      { where: { id: id } },
    )
    if (!update) {
      throw new Error('Update failed')
    } else {
      return
    }
  }

  /**
   * Update a post
   * @param Post Post to be updated
   * @returns boolean Indicate if update was successful
   */
  updatePost = async ({
    id,
    tagname,
    description,
    title,
  }: PostEditType): Promise<boolean> => {
    await this.Post.update({ title, description }, { where: { id: id } })

    const tagList = await this.getExistingTagsFromRequestTags(tagname)

    // easier way is to delete anything of the postId and recreate
    // of course calculating the changes would be the way to go
    await this.PostTag.destroy({ where: { postId: id } })

    let updated

    for (const tag of tagList) {
      // Create a posttag for each tag
      updated = await this.PostTag.create({
        postId: id,
        tagId: tag.id,
      })
    }

    if (updated) {
      return true
    }
    return false
  }
}
