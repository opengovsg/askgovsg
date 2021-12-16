import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { Sequelize } from 'sequelize/types'
import { PostTag } from '../../../models'
import { PostCreation } from '../../../models/posts.model'
import { AgencyService } from '../../agency/agency.service'
import { AnswersService } from '../../answers/answers.service'
import { PostService } from '../../post/post.service'
import { ModelDef } from '../../../types/sequelize'
import {
  createTestDatabase,
  getModelDef,
  ModelName,
} from '../../../util/jest-db'
import supertest from 'supertest'
import {
  Agency,
  Answer,
  Post,
  Tag,
  Topic,
  User,
  PostStatus,
} from '~shared/types/base'
import { WebController } from '../web.controller'
import { routeWeb } from '../web.routes'
import { WebService } from '../web.service'

describe('/', () => {
  let Answer: ModelDef<Answer>
  let Post: ModelDef<Post, PostCreation>
  let PostTag: ModelDef<PostTag>
  let Tag: ModelDef<Tag>
  let Topic: ModelDef<Topic>
  let User: ModelDef<User>
  let Agency: ModelDef<Agency>

  let db: Sequelize
  let webController: WebController
  let mockAgency: Agency
  let mockUser: User
  let mockTopic: Topic
  let mockPost: Post
  let mockPostWithNoAnswers: Post

  beforeAll(async () => {
    db = await createTestDatabase()
    Answer = getModelDef<Answer>(db, ModelName.Answer)
    Post = getModelDef<Post, PostCreation>(db, ModelName.Post)
    PostTag = getModelDef<PostTag>(db, ModelName.PostTag)
    Tag = getModelDef<Tag>(db, ModelName.Tag)
    Topic = getModelDef<Topic>(db, ModelName.Topic)
    User = getModelDef<User>(db, ModelName.User)
    Agency = getModelDef<Agency>(db, ModelName.Agency)

    const searchSyncService = {
      createPost: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
    }
    const answersService = new AnswersService({
      Post,
      Answer,
      searchSyncService,
      sequelize: db,
    })
    const agencyService = new AgencyService({ Agency })
    const postService = new PostService({
      Answer,
      Post,
      PostTag,
      Tag,
      User,
      Topic,
      searchSyncService,
      sequelize: db,
    })
    const webService = new WebService()
    const indexStr =
      '<!doctype html><html lang="en"><head><meta charset="utf-8"/><link rel="icon" href="/favicon.ico"/><link rel="icon" type="image/svg+xml" href="/icon.svg"/><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/><link rel="manifest" href="/manifest.json"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" media="(prefers-color-scheme: light)" content="white"><meta name="theme-color" media="(prefers-color-scheme: dark)" content="black"><title>AskGov</title><meta name="description" content="Answers from the Singapore Government" data-rh="true"/><meta property="og:title" content="AskGov"/><meta property="og:description" content="Answers from the Singapore Government"/><meta property="og:image" content="/logo512.png"/><meta property="og:type" content="website"/><link rel="preconnect" href="https://fonts.gstatic.com"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&display=swap" rel="preload stylesheet" as="style" crossorigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap" rel="preload stylesheet" as="style" crossorigin="anonymous"/><link href="/static/css/2.8e4e8e1f.chunk.css" rel="stylesheet"><link href="/static/css/main.ef5a197a.chunk.css" rel="stylesheet"></head><body><div id="root"></div><script src="/static/js/runtime-main.7545a8a1.js"></script><script src="/static/js/2.e182fae7.chunk.js"></script><script src="/static/js/main.51d19d55.chunk.js"></script></body></html>'
    const index = Buffer.from(indexStr)
    mockAgency = await Agency.create({
      shortname: `L`,
      longname: `Longname`,
      email: `enquiries@ask.gov.sg`,
      logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
      noEnquiriesMessage: null,
      website: null,
      displayOrder: null,
    })
    mockUser = await User.create({
      username: `user@ask.gov.sg`,
      displayname: `user`,
      agencyId: mockAgency.id,
      views: 1,
    })
    mockTopic = await Topic.create({
      name: '1',
      description: '',
      agencyId: mockAgency.id,
      parentId: null,
    })
    mockPost = await Post.create({
      title: 'title',
      description: '',
      status: PostStatus.Public,
      userId: mockUser.id,
      agencyId: mockAgency.id,
      topicId: mockTopic.id,
    })
    mockPostWithNoAnswers = await Post.create({
      title: 'title',
      description: '',
      status: PostStatus.Public,
      userId: mockUser.id,
      agencyId: mockAgency.id,
      topicId: mockTopic.id,
    })
    await Answer.create({
      body: `<p>This is an answer to post ${mockPost.id}.</p>`,
      userId: mockUser.id,
      postId: mockPost.id,
    })

    webController = new WebController({
      agencyService,
      answersService,
      postService,
      webService,
      index,
    })
  })

  afterAll(async () => {
    await db.close()
  })

  describe('/agency/:shortname', () => {
    it('returns OK on getting agency index file', async () => {
      const agencyPageIndex = `<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><link rel=\"icon\" href=\"/favicon.ico\"><link rel=\"icon\" type=\"image/svg+xml\" href=\"/icon.svg\"><link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"/favicon-32x32.png\"><link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"/favicon-16x16.png\"><link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"/apple-touch-icon.png\"><link rel=\"manifest\" href=\"/manifest.json\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"theme-color\" media=\"(prefers-color-scheme: light)\" content=\"white\"><meta name=\"theme-color\" media=\"(prefers-color-scheme: dark)\" content=\"black\"><title>${mockAgency.shortname} FAQ - AskGov</title><meta name=\"description\" content=\"Answers from ${mockAgency.longname} (${mockAgency.shortname})\" data-rh=\"true\"><meta property=\"og:title\" content=\"${mockAgency.shortname} FAQ - AskGov\"><meta property=\"og:description\" content=\"Answers from ${mockAgency.longname} (${mockAgency.shortname})\"><meta property=\"og:image\" content=\"/logo512.png\"><meta property=\"og:type\" content=\"website\"><link rel=\"preconnect\" href=\"https://fonts.gstatic.com\"><link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&amp;display=swap\" rel=\"preload stylesheet\" as=\"style\" crossorigin=\"anonymous\"><link href=\"https://fonts.googleapis.com/css2?family=Poppins:wght@600&amp;display=swap\" rel=\"preload stylesheet\" as=\"style\" crossorigin=\"anonymous\"><link href=\"/static/css/2.8e4e8e1f.chunk.css\" rel=\"stylesheet\"><link href=\"/static/css/main.ef5a197a.chunk.css\" rel=\"stylesheet\"></head><body><div id=\"root\"></div><script src=\"/static/js/runtime-main.7545a8a1.js\"></script><script src=\"/static/js/2.e182fae7.chunk.js\"></script><script src=\"/static/js/main.51d19d55.chunk.js\"></script></body></html>`
      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get(`/agency/${mockAgency.shortname}`)
      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.text).toEqual(agencyPageIndex)
    })

    it('returns MOVED_PERMANENTLY and redirects to not-found if agency does not exist', async () => {
      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get(`/agency/invalidagency`)
      expect(response.status).toEqual(StatusCodes.MOVED_PERMANENTLY)
      expect(response.text).toEqual(
        'Moved Permanently. Redirecting to /not-found',
      )
      expect(response.header.location).toEqual('/not-found')
    })
  })

  describe('/questions/:id', () => {
    it('returns OK on getting question index file', async () => {
      const questionPageIndex = `<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><link rel=\"icon\" href=\"/favicon.ico\"><link rel=\"icon\" type=\"image/svg+xml\" href=\"/icon.svg\"><link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"/favicon-32x32.png\"><link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"/favicon-16x16.png\"><link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"/apple-touch-icon.png\"><link rel=\"manifest\" href=\"/manifest.json\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"theme-color\" media=\"(prefers-color-scheme: light)\" content=\"white\"><meta name=\"theme-color\" media=\"(prefers-color-scheme: dark)\" content=\"black\"><title>title - AskGov</title><meta name=\"description\" content=\"This is an answer to post ${mockPost.id}.\" data-rh=\"true\"><meta property=\"og:title\" content=\"title - AskGov\"><meta property=\"og:description\" content=\"This is an answer to post ${mockPost.id}.\"><meta property=\"og:image\" content=\"/logo512.png\"><meta property=\"og:type\" content=\"article\"><link rel=\"preconnect\" href=\"https://fonts.gstatic.com\"><link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&amp;display=swap\" rel=\"preload stylesheet\" as=\"style\" crossorigin=\"anonymous\"><link href=\"https://fonts.googleapis.com/css2?family=Poppins:wght@600&amp;display=swap\" rel=\"preload stylesheet\" as=\"style\" crossorigin=\"anonymous\"><link href=\"/static/css/2.8e4e8e1f.chunk.css\" rel=\"stylesheet\"><link href=\"/static/css/main.ef5a197a.chunk.css\" rel=\"stylesheet\"></head><body><div id=\"root\"></div><script src=\"/static/js/runtime-main.7545a8a1.js\"></script><script src=\"/static/js/2.e182fae7.chunk.js\"></script><script src=\"/static/js/main.51d19d55.chunk.js\"></script></body></html>`
      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get(`/questions/${mockPost.id}`)
      expect(response.statusCode).toEqual(StatusCodes.OK)
      expect(response.text).toEqual(questionPageIndex)
    })

    it('returns BAD_REQUEST if post id is not number', async () => {
      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get(`/questions/postIdNotNum`)
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    })

    it('returns MOVED_PERMANENTLY and redirects to not-found if post id does not exist', async () => {
      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get(`/questions/100`)
      expect(response.statusCode).toEqual(StatusCodes.MOVED_PERMANENTLY)
      expect(response.text).toEqual(
        'Moved Permanently. Redirecting to /not-found',
      )
      expect(response.header.location).toEqual('/not-found')
    })

    it('returns MOVED_PERMANENTLY and redirects to not-found if post has no answers', async () => {
      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get(
        `/questions/${mockPostWithNoAnswers.id}`,
      )
      expect(response.statusCode).toEqual(StatusCodes.MOVED_PERMANENTLY)
      expect(response.text).toEqual(
        'Moved Permanently. Redirecting to /not-found',
      )
      expect(response.header.location).toEqual('/not-found')
    })
  })

  describe('/sitemap.xml', () => {
    it('returns OK on getting sitemap xml file', async () => {
      const lastModDate = new Date().toISOString().split('T')[0]
      const expectedSitemap = `<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://ask.gov.sg/</loc>\n    <lastmod>${lastModDate}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/terms</loc>\n    <lastmod>${lastModDate}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/privacy</loc>\n    <lastmod>${lastModDate}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/questions/1</loc>\n    <lastmod>${lastModDate}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/questions/2</loc>\n    <lastmod>${lastModDate}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/agency/${mockAgency.shortname}</loc>\n    <lastmod>${lastModDate}</lastmod>\n  </url>\n</urlset>`
      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get('/sitemap.xml')
      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.text).toEqual(expectedSitemap)
    })
  })
})
