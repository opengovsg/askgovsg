import { PostService } from '../post.service'
import { Sequelize } from 'sequelize'
import {
  defineAgency,
  defineAnswer,
  definePostAndPostTag,
  defineTag,
  defineUserAndPermission,
} from '../../../models'
import minimatch from 'minimatch'
import { SortType } from '../../../types/sort-type'

describe('PostService', () => {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    username: 'username',
    logging: false,
  })
  const emailValidator = new minimatch.Minimatch('*')

  const Tag = defineTag(sequelize)
  const { User } = defineUserAndPermission(sequelize, {
    Tag,
    emailValidator,
  })
  const { Post, PostTag } = definePostAndPostTag(sequelize, { User, Tag })
  const Answer = defineAnswer(sequelize, { User, Post })
  const postService = new PostService({ Answer, Post, PostTag, Tag, User })
  const mockPosts = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ].map((x) => Post.build({ title: x }))
  const mockUser = User.build()
  const PostModel = jest.spyOn(Post, 'findAll').mockResolvedValue(mockPosts)
  const TagModel = jest.spyOn(Tag, 'findAll').mockResolvedValue([])
  const UserModel = jest.spyOn(User, 'findOne').mockResolvedValue(mockUser)
  const PostTagModel = jest.spyOn(PostTag, 'findAll').mockResolvedValue([])

  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('retrieveAll', () => {
    it('should return all data with no page query', async () => {
      // Act
      const result = await postService.retrieveAll({
        sort: SortType.Basic,
        tags: '',
      })

      // Assert
      expect(result.posts.length).toStrictEqual(20)
      expect(result.totalItems).toStrictEqual(20)
    })

    it('should return first 10 posts with query on page 1, size 10', async () => {
      // Act
      const result = await postService.retrieveAll({
        sort: SortType.Basic,
        tags: '',
        page: 1,
        size: 10,
      })
      // Assert
      expect(result.posts.length).toStrictEqual(10)
      expect(result.totalItems).toStrictEqual(20)
      expect(result.posts[0].title).toStrictEqual(1)
      expect(result.posts[9].title).toStrictEqual(10)
    })
    it('should return 11-15th posts with query on page 3, size 5', async () => {
      // Act
      const result = await postService.retrieveAll({
        sort: SortType.Basic,
        tags: '',
        page: 3,
        size: 5,
      })
      // Assert
      expect(result.posts.length).toStrictEqual(5)
      expect(result.totalItems).toStrictEqual(20)
      expect(result.posts[0].title).toStrictEqual(11)
      expect(result.posts[4].title).toStrictEqual(15)
    })
  })

  describe('listAnswerablePosts', () => {
    it('should return all data with no page query', async () => {
      // Act
      const result = await postService.listAnswerablePosts({
        userId: '',
        sort: SortType.Basic,
        withAnswers: true,
      })

      // Assert
      expect(result.posts.length).toStrictEqual(20)
      expect(result.totalItems).toStrictEqual(20)
    })

    it('should return 4-6th posts with query on page 2, size 3', async () => {
      // Act
      const result = await postService.listAnswerablePosts({
        userId: '',
        sort: SortType.Basic,
        withAnswers: true,
        page: 2,
        size: 3,
      })

      // Assert
      expect(result.posts.length).toStrictEqual(3)
      expect(result.totalItems).toStrictEqual(20)
      expect(result.posts[0].title).toStrictEqual(4)
      expect(result.posts[2].title).toStrictEqual(6)
    })
    it('should return 15-20th posts with query on page 2, size 15', async () => {
      // Act
      const result = await postService.retrieveAll({
        sort: SortType.Basic,
        tags: '',
        page: 2,
        size: 15,
      })
      // Assert
      expect(result.posts.length).toStrictEqual(5)
      expect(result.totalItems).toStrictEqual(20)
      expect(result.posts[0].title).toStrictEqual(16)
      expect(result.posts[4].title).toStrictEqual(20)
    })
  })
})
