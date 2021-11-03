import { Model, Sequelize } from 'sequelize'
import {
  Agency,
  Post,
  PostStatus,
  Tag,
  TagType,
  User,
} from '~shared/types/base'
import { PostCreation } from '../../../models/posts.model'
import { ModelDef } from '../../../types/sequelize'
import {
  createTestDatabase,
  getModelDef,
  ModelName,
} from '../../../util/jest-db'
import { TagsService } from '../tags.service'

describe('TagsService', () => {
  let agency: Agency
  let tag: Model & Tag
  let user: User
  let post: Post

  let db: Sequelize
  let Post: ModelDef<Post, PostCreation>
  let Tag: ModelDef<Tag>

  let service: TagsService
  beforeAll(async () => {
    db = await createTestDatabase()
    Post = getModelDef<Post, PostCreation>(db, ModelName.Post)
    Tag = getModelDef<Tag>(db, ModelName.Tag)

    const Agency = getModelDef<Agency>(db, ModelName.Agency)
    const User = getModelDef<User>(db, ModelName.User)

    service = new TagsService({ Agency, Post, Tag, User })

    agency = await Agency.create({
      shortname: 'was',
      longname: 'Work Allocation Singapore',
      email: 'enquiries@was.gov.sg',
      logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
      noEnquiriesMessage: null,
      website: null,
      displayOrder: null,
    })

    user = await User.create({
      username: 'enquiries@was.gov.sg',
      displayname: 'Enquiries @ WAS',
      views: 0,
      agencyId: agency.id,
    })
  })

  beforeEach(async () => {
    await Post.destroy({ truncate: true })
    await Tag.destroy({ truncate: true })
    post = await Post.create({
      title: 'Post',
      description: null,
      agencyId: agency.id,
      userId: user.id,
      topicId: null,
      status: PostStatus.Private,
    })
    tag = (await Tag.create({
      tagname: 'Topic Tag',
      description: '',
      link: '',
      hasPilot: false,
      tagType: TagType.Topic,
    })) as Model & Tag

    // Tag the post programmatically
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await post.addTag(tag)
  })

  afterAll(async () => {
    await db.close()
  })

  describe('listTags', () => {
    it('lists all known tags', async () => {
      const expectedAttributes = { ...tag.toJSON(), postsCount: 1 }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete expectedAttributes.updatedAt

      const tags = await service.listTags()
      const [actualTag] = tags

      expect(tags.length).toEqual(1)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(actualTag.toJSON()).toMatchObject(expectedAttributes)
    })
  })

  describe('getSingleTag', () => {
    it('returns an existing tag', async () => {
      const expectedAttributes = { ...tag.toJSON(), postsCount: 1 }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete expectedAttributes.updatedAt
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete expectedAttributes.link
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete expectedAttributes.tagType
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete expectedAttributes.hasPilot

      const actualTag = await service.getSingleTag(tag.tagname)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(actualTag.toJSON()).toMatchObject(expectedAttributes)
    })
    it('throws on bad tag', async () => {
      await expect(service.getSingleTag('Bad Tag')).rejects.toStrictEqual(
        new Error('Tag not found'),
      )
    })
  })
})
