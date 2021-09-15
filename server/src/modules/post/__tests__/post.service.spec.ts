import { ModelCtor, Sequelize } from 'sequelize/types'
import {
  Answer as AnswerModel,
  Post as PostModel,
  Tag as TagModel,
  PostTag as PostTagModel,
  User as UserModel,
  Permission as PermissionModel,
} from '../../../models'
import {
  PermissionType,
  PostStatus,
  TagType,
} from '../../../../../shared/types/base'
import { SortType } from '../../../types/sort-type'
import { createTestDatabase, getModel, ModelName } from '../../../util/jest-db'
import { PostService } from '../post.service'

describe('PostService', () => {
  let db: Sequelize
  let Answer: ModelCtor<AnswerModel>
  let Post: ModelCtor<PostModel>
  let PostTag: ModelCtor<PostTagModel>
  let Tag: ModelCtor<TagModel>
  let User: ModelCtor<UserModel>
  let Permission: ModelCtor<PermissionModel>
  let postService: PostService
  const mockPosts: PostModel[] = []
  let mockUser: UserModel
  let mockTag: TagModel

  beforeAll(async () => {
    db = await createTestDatabase()
    Answer = getModel<AnswerModel>(db, ModelName.Answer)
    Post = getModel<PostModel>(db, ModelName.Post)
    PostTag = getModel<PostTagModel>(db, ModelName.PostTag)
    Tag = getModel<TagModel>(db, ModelName.Tag)
    User = getModel<UserModel>(db, ModelName.User)
    Permission = getModel<PermissionModel>(db, ModelName.Permission)
    postService = new PostService({ Answer, Post, PostTag, Tag, User })
    mockUser = await User.create({
      username: 'answerer@test.gov.sg',
      displayname: '',
    })
    mockTag = await Tag.create({
      tagname: 'test',
      description: '',
      link: '',
      hasPilot: true,
      tagType: TagType.Topic,
    })
    for (let title = 1; title <= 20; title++) {
      const mockPost = await Post.create({
        title: title.toString(),
        status: PostStatus.Public,
        userId: mockUser.id,
      })
      mockPosts.push(mockPost)
      await PostTag.create({ postId: mockPost.id, tagId: mockTag.id })
    }
    await Permission.create({
      userId: mockUser.id,
      tagId: mockTag.id,
      role: PermissionType.Answerer,
    })
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await db.close()
  })

  describe('listPosts', () => {
    it('should return all data with no page query', async () => {
      // Act
      const result = await postService.listPosts({
        sort: SortType.Top,
        tags: mockTag.tagname,
      })

      // Assert
      expect(result.posts.length).toStrictEqual(mockPosts.length)
      expect(result.totalItems).toStrictEqual(mockPosts.length)
    })

    it('should return first 10 posts with query on page 1, size 10', async () => {
      // Act
      const result = await postService.listPosts({
        sort: SortType.Top,
        tags: '',
        page: 1,
        size: 10,
      })
      // Assert
      expect(result.posts.length).toStrictEqual(10)
      expect(result.totalItems).toStrictEqual(mockPosts.length)
      expect(result.posts[0].title).toBe(mockPosts[0].title)
      expect(result.posts[9].title).toBe(mockPosts[9].title)
    })
    it('should return 11-15th posts with query on page 3, size 5', async () => {
      // Act
      const result = await postService.listPosts({
        sort: SortType.Top,
        tags: '',
        page: 3,
        size: 5,
      })
      // Assert
      expect(result.posts.length).toStrictEqual(5)
      expect(result.totalItems).toStrictEqual(mockPosts.length)
      expect(result.posts[0].title).toStrictEqual(mockPosts[10].title)
      expect(result.posts[4].title).toStrictEqual(mockPosts[14].title)
    })
  })

  describe('listAnswerablePosts', () => {
    it('should return error when the user ID is invalid', async () => {
      try {
        await postService.listAnswerablePosts({
          userId: 2,
          sort: SortType.Top,
          withAnswers: false,
        })
        // Act
        throw new Error('Test was force-failed')
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(Error)
        if (error instanceof Error) {
          expect(error.message).toBe('Unable to find user with given ID')
        }
      }
    })

    it('should return all data with no page query', async () => {
      // Act
      const result = await postService.listAnswerablePosts({
        userId: mockUser.id,
        sort: SortType.Top,
        withAnswers: false,
      })

      // Assert
      expect(result.posts.length).toStrictEqual(mockPosts.length)
      expect(result.totalItems).toStrictEqual(mockPosts.length)
    })

    it('should return 4-6th posts with query on page 2, size 3', async () => {
      // Act
      const result = await postService.listAnswerablePosts({
        userId: mockUser.id,
        sort: SortType.Top,
        withAnswers: false,
        page: 2,
        size: 3,
      })

      // Assert
      expect(result.posts.length).toStrictEqual(3)
      expect(result.totalItems).toStrictEqual(mockPosts.length)
      expect(result.posts[0].title).toStrictEqual(mockPosts[3].title)
      expect(result.posts[2].title).toStrictEqual(mockPosts[5].title)
    })

    it('should return 15-20th posts with query on page 2, size 15', async () => {
      // Act
      const result = await postService.listAnswerablePosts({
        userId: mockUser.id,
        sort: SortType.Top,
        withAnswers: false,
        page: 2,
        size: 15,
      })
      // Assert
      expect(result.posts.length).toStrictEqual(5)
      expect(result.totalItems).toStrictEqual(mockPosts.length)
      expect(result.posts[0].title).toStrictEqual(mockPosts[15].title)
      expect(result.posts[4].title).toStrictEqual(mockPosts[19].title)
    })
  })
})
