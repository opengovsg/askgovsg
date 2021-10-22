import Sequelize, {
  Model,
  ModelCtor,
  Op,
  OrderItem,
  ProjectionAlias,
} from 'sequelize'
import { PostCreation } from 'src/models/posts.model'
import { Post, PostStatus, Topic, Agency } from '~shared/types/base'
import { Answer, PostTag, Tag, User } from '../../models'
import { PostEditType } from '../../types/post-type'
import { ModelDef } from '../../types/sequelize'
import { SortType } from '../../types/sort-type'
import { PostWithRelations } from '../auth/auth.service'

export type UserWithTagRelations = {
  getTags: () => Tag[]
}

export type PostWithUserTopicTagRelations = Model &
  Post & {
    countAnswers: () => number
    tags: Tag[]
    topics: Topic[]
  }

export type PostWithUserTopicTagRelatedPostRelations = PostWithRelations &
  PostWithUserTopicTagRelations & {
    getRelatedPosts: Post[]
  }

export class PostService {
  private Answer: ModelCtor<Answer>
  private Post: ModelDef<Post, PostCreation>
  private PostTag: ModelDef<PostTag>
  private Tag: ModelCtor<Tag>
  private User: ModelCtor<User>
  private Topic: ModelDef<Topic>
  private Agency: ModelDef<Agency>
  constructor({
    Answer,
    Post,
    PostTag,
    Tag,
    User,
    Topic,
    Agency,
  }: {
    Answer: ModelCtor<Answer>
    Post: ModelDef<Post, PostCreation>
    PostTag: ModelDef<PostTag>
    Tag: ModelCtor<Tag>
    User: ModelCtor<User>
    Topic: ModelDef<Topic>
    Agency: ModelDef<Agency>
  }) {
    this.Answer = Answer
    this.Post = Post
    this.PostTag = PostTag
    this.Tag = Tag
    this.User = User
    this.Topic = Topic
    this.Agency = Agency
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
      return ['updatedAt', 'DESC']
    }
    return ['views', 'DESC']
  }

  private filterPostsWithoutAnswers = async (
    data?: PostWithUserTopicTagRelations[],
  ): Promise<Post[]> => {
    if (!data) {
      return []
    } else {
      const answerPromises = data.map((p) => p.countAnswers())
      const answerCounts = await Promise.all(answerPromises)
      return data.filter((_, index) => answerCounts[index] === 0)
    }
  }

  /**
   * Get posts related to the one provided
   * There is room to improve on finding related posts, using a better algorithm
   * as discussed https://meta.stackexchange.com/questions/20473/how-are-related-questions-selected or
   * https://medium.com/analytics-vidhya/building-a-simple-stack-overflow-search-engine-to-predict-posts-related-to-given-query-post-56b3e508520c.
   * As a preliminary step, it finds the posts with the
   * most number of same tag, followed by number of views.
   * @param post post to find related posts to
   * @param numberOfRelatedPosts number of posts to find
   * @returns posts that are related to the one provided
   */
  private getRelatedPosts = async (
    post: PostWithUserTopicTagRelations,
    numberOfRelatedPosts: number,
  ): Promise<Post[]> => {
    const tags = post.tags.map((tag) => tag.id)
    const relatedPosts = await this.Post.findAll({
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('tags.id')), 'relatedTags'],
        ],
      },
      where: {
        status: PostStatus.Public,
        id: {
          [Op.ne]: post.id,
        },
      },
      include: [
        {
          model: this.Tag,
          attributes: [],
          required: false,
          through: {
            attributes: [],
          },
          where: {
            id: tags,
          },
        },
      ],
      group: 'id',
      order: [
        [Sequelize.col('relatedTags'), 'DESC'],
        ['views', 'DESC'],
      ],
      subQuery: false,
      limit: numberOfRelatedPosts,
    })

    return relatedPosts
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

  getExistingTagsFromRequestTags = async (
    tagNames: string[],
  ): Promise<Tag[]> => {
    const existingTags = await this.Tag.findAll({
      where: { tagname: tagNames },
    })
    return existingTags
  }

  getTopicsUsedByAgencyFlatlist = async (
    agencyId: number,
  ): Promise<Topic[]> => {
    const topics = await this.Topic.findAll({
      where: { agencyId: agencyId },
    })
    return topics
  }

  getExistingTopicFromRequestTopic = async (
    topicName: string,
    agencyId: number,
  ): Promise<Topic | null> => {
    const existingTopic = await this.Topic.findOne({
      where: { name: topicName, agencyId: agencyId },
    })
    return existingTopic
  }

  // returns list of topics that exist in the DB
  getExistingTopicsFromRequestTopics = async (
    topics: string[],
    agencyId: number,
  ): Promise<Topic[]> => {
    const existingTopics = await this.Topic.findAll({
      where: { name: topics, agencyId: agencyId },
    })
    return existingTopics
  }

  // returns list of topics comprising topics in query, and their descendant topics if they exist
  getChildTopicsFromRequestTopics = async (
    topics: Topic[],
    agencyId: number,
  ): Promise<Topic[]> => {
    // extract Ids from topics
    const existingTopicIds = topics.map((topic) => topic.id)

    // get list of topics belonging to agency
    const agencyTopics: Topic[] = await this.Topic.findAll({
      where: {
        agencyId: agencyId,
      },
    })

    let parentAndChildTopics: Topic[] = topics

    if (topics) {
      let currGenChildTopics = agencyTopics.filter(
        (topic) =>
          !!topic.parentId && existingTopicIds.includes(topic.parentId),
      )
      parentAndChildTopics = parentAndChildTopics.concat(currGenChildTopics)

      while (currGenChildTopics.length) {
        const currGenChildTopicIds = currGenChildTopics.map((topic) => topic.id)
        const nextGenChildTopics = agencyTopics.filter(
          (topic) =>
            !!topic.parentId && currGenChildTopicIds.includes(topic.parentId),
        )
        parentAndChildTopics = parentAndChildTopics.concat(nextGenChildTopics)
        currGenChildTopics = nextGenChildTopics
      }
    }
    return parentAndChildTopics
  }

  /**
   * Lists all post
   * @param sort Sort by popularity or recent
   * @param agency Agency id to filter by
   * @param tags Tags to filter by
   * @param topics Topics to filter by
   * @param size Number of posts to return
   * @param page If size is given, specify which page to return
   */
  listPosts = async ({
    sort,
    agency,
    tags,
    topics,
    page,
    size,
  }: {
    sort: SortType
    agency: number
    tags: string
    topics: string
    page?: number
    size?: number
  }): Promise<{
    posts: Post[]
    totalItems: number
  }> => {
    // split tags
    let tagsUnchecked: string[] = []
    if (tags) {
      tagsUnchecked = tags.split(',')
    }

    // returns length of tags that are valid in DB
    const tagList = await this.getExistingTagsFromRequestTags(tagsUnchecked)
    // prevent search if tags query is invalid
    if (tagList.length != tagsUnchecked.length) {
      throw new Error('Invalid tags used in request')
    }
    // convert back to raw tags in array form
    const rawTags = tagList.map((element) => element.tagname)

    // topics
    let topicsUnchecked: string[] = []
    if (topics) {
      topicsUnchecked = topics.split(',')
    }

    // returns length of topics that are valid in DB
    const topicList = agency
      ? await this.getExistingTopicsFromRequestTopics(topicsUnchecked, agency)
      : []

    if (topicList.length != topicsUnchecked.length) {
      throw new Error('Invalid topics used in request')
    }

    // returns length of topics and their child topics
    // since we also want to list posts belonging to subtopics of current topics
    const topicAndChildTopics = agency
      ? await this.getChildTopicsFromRequestTopics(topicList, agency)
      : []
    // returns topic ids
    const rawTopicIds: number[] = topicAndChildTopics.map((topic) => topic.id)

    const whereobj = {
      status: PostStatus.Public,
      ...(tagList.length ? { '$tags.tagname$': { [Op.in]: rawTags } } : {}),
      ...(agency ? { agencyId: agency } : {}),
      ...(topicList.length ? { topicId: rawTopicIds } : {}),
    }

    const orderarray = this.sortFunction(sort)

    //return posts filtered by agency, topics and tags
    const posts = (await this.Post.findAll({
      where: whereobj,
      order: [orderarray],
      include: [
        {
          model: this.Tag,
          required: true,
          attributes: ['tagname', 'description', 'tagType'],
        },
        { model: this.User, required: true, attributes: ['username'] },
        this.Answer,
        {
          model: this.Topic,
          required: false,
          attributes: ['name', 'description'],
        },
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
        'topicId',
      ],
    })) as PostWithUserTopicTagRelations[]

    if (!posts) {
      return { posts: [], totalItems: 0 }
    } else {
      return this.getPaginatedPosts(posts, page, size)
    }
  }

  /**
   * Lists all post answerable by the agency user
   * @param userId ID of user
   * @param sort Sort by popularity or recent
   * @param Agency id to filter by
   * @param withAnswers If false, show only posts without answers
   * @param tags Tags to filter by
   * @param topics Topics to filter by
   * @param size Number of posts to return
   * @param page If size is given, specify which page to return
   */
  listAnswerablePosts = async ({
    userId,
    sort,
    withAnswers,
    tags,
    topics,
    page,
    size,
  }: {
    userId: number
    sort: SortType
    withAnswers: boolean
    tags?: string
    topics?: string
    page?: number
    size?: number
  }): Promise<{
    posts: Post[]
    totalItems: number
  }> => {
    const user = await this.User.findByPk(userId)
    if (!user) {
      throw new Error('Unable to find user with given ID')
    }

    // Same as in listPosts, except that agencyId is replaced by user's agencyId
    // split tags
    let tagsUnchecked: string[] = []
    if (tags) {
      tagsUnchecked = tags.split(',')
    }

    // returns length of tags that are valid in DB
    const tagList = await this.getExistingTagsFromRequestTags(tagsUnchecked)
    // prevent search if tags query is invalid
    if (tagList.length != tagsUnchecked.length) {
      throw new Error('Invalid tags used in request')
    }
    // convert back to raw tags in array form
    const rawTags = tagList.map((element) => element.tagname)

    // topics
    let topicsUnchecked: string[] = []
    if (topics) {
      topicsUnchecked = topics.split(',')
    }

    // returns length of topics that are valid in DB
    const topicList = user.agencyId
      ? await this.getExistingTopicsFromRequestTopics(
          topicsUnchecked,
          user.agencyId,
        )
      : []

    if (topicList.length != topicsUnchecked.length) {
      throw new Error('Invalid topics used in request')
    }

    // returns length of topics and their child topics
    // since we also want to list posts belonging to subtopics of current topics
    const topicAndChildTopics = user.agencyId
      ? await this.getChildTopicsFromRequestTopics(topicList, user.agencyId)
      : []
    // returns topic ids
    const rawTopicIds: number[] = topicAndChildTopics.map((topic) => topic.id)

    const whereobj = {
      agencyId: user.agencyId,
      status: { [Op.ne]: PostStatus.Archived },
      ...(tagList.length ? { '$tags.tagname$': { [Op.in]: rawTags } } : {}),
      ...(topicList.length ? { topicId: rawTopicIds } : {}),
    }

    const posts = (await this.Post.findAll({
      where: whereobj,
      order: [this.sortFunction(sort)],
      include: [
        {
          model: this.Tag,
          required: true,
          attributes: ['tagname', 'description', 'tagType'],
        },
        { model: this.User, required: true, attributes: ['username'] },
        { model: this.Answer, required: withAnswers },
        {
          model: this.Topic,
          required: false,
          attributes: ['name', 'description'],
        },
      ],
      attributes: [
        'id',
        'userId',
        'agencyId',
        'title',
        'description',
        'createdAt',
        'views',
        this.answerCountLiteral,
        'topicId',
      ],
    })) as PostWithUserTopicTagRelations[]

    if (!posts) {
      return { posts: [], totalItems: 0 }
    } else if (withAnswers) {
      return this.getPaginatedPosts(posts, page, size)
    } else {
      // posts without answers
      const filteredPosts = await this.filterPostsWithoutAnswers(posts)
      return this.getPaginatedPosts(filteredPosts, page, size)
    }
  }

  /**
   * Get a single post and all the tags, topic and users associated with it
   * @param postId Id of the post
   * @param noOfRelatedPosts number of related posts to show
   */
  getSinglePost = async (
    postId: number,
    noOfRelatedPosts = 0,
    updateViewCount = true,
  ): Promise<
    PostWithUserTopicTagRelations | PostWithUserTopicTagRelatedPostRelations
  > => {
    if (updateViewCount) {
      await this.Post.increment(
        {
          views: +1,
        },
        {
          where: {
            id: postId,
          },
          silent: true,
        },
      )
    }
    const post = (await this.Post.findOne({
      where: {
        status: PostStatus.Public,
        id: postId,
      },
      include: [
        this.Tag,
        { model: this.User, attributes: ['displayname'] },
        { model: this.Topic, attributes: ['name', 'description'] },
      ],
      attributes: [
        'id',
        'userId',
        'agencyId',
        'title',
        'description',
        'createdAt',
        'updatedAt',
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
        'topicId',
      ],
    })) as PostWithUserTopicTagRelatedPostRelations
    if (!post) {
      throw new Error('No public post with this id')
    } else {
      if (noOfRelatedPosts > 0) {
        const relatedPosts = await this.getRelatedPosts(post, noOfRelatedPosts)
        post.setDataValue('relatedPosts', relatedPosts)
      }
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
    userId: number
    agencyId: number
    tagname: string[]
    topicname: string
  }): Promise<number> => {
    const tagList = await this.getExistingTagsFromRequestTags(newPost.tagname)
    const topicValid = await this.getExistingTopicFromRequestTopic(
      newPost.topicname,
      newPost.agencyId,
    )

    // Only create post if tag or topic exists
    if (!topicValid && newPost.tagname.length !== tagList.length) {
      throw new Error('At least one valid tag or topic is required')
    } else {
      if (newPost.tagname.length !== tagList.length) {
        throw new Error('At least one tag does not exist')
      }
      if (!topicValid && newPost.topicname) {
        throw new Error('Topic does not exist')
      }
      const post = await this.Post.create({
        title: newPost.title,
        description: newPost.description,
        userId: newPost.userId,
        agencyId: newPost.agencyId,
        status: PostStatus.Private,
        topicId: topicValid?.id ?? null,
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
  deletePost = async (id: number): Promise<void> => {
    const update = await this.Post.update(
      { status: PostStatus.Archived },
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
    userid,
    tagname,
    topicname,
    description,
    title,
  }: PostEditType): Promise<boolean> => {
    const user = await this.User.findByPk(userid)

    // retrieve topic
    const topic = user?.agencyId
      ? await this.getExistingTopicFromRequestTopic(topicname, user.agencyId)
      : null
    if (!!topicname && !topic) {
      throw new Error('Topic does not exist')
    }

    await this.Post.update(
      { title, description, topicId: topic?.id },
      { where: { id: id } },
    )

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
