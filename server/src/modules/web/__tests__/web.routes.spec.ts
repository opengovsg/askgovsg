import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { Sequelize } from 'sequelize'
import { PostCreation } from '../../../models/posts.model'
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
  Topic,
  User,
  PostStatus,
} from '~shared/types/base'
import { WebController } from '../web.controller'
import { routeWeb } from '../web.routes'
import { errAsync, okAsync } from 'neverthrow'
import { MissingAgencyError } from '../../../modules/agency/agency.errors'
import { DatabaseError } from '../../core/core.errors'
import { SitemapLeaf } from 'express-sitemap-xml'
import { SortType } from '../../../types/sort-type'
import { MissingPublicPostError } from '../../post/post.errors'

describe('/', () => {
  let Answer: ModelDef<Answer>
  let Post: ModelDef<Post, PostCreation>
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
  let mockAnswer: Answer

  const agencyService = {
    findOneByName: jest.fn(),
    findOneById: jest.fn(),
    listAgencyShortNames: jest.fn(),
    listAllAgencies: jest.fn()
  }
  const answersService = {
    listAnswers: jest.fn(),
    createAnswer: jest.fn(),
    updateAnswer: jest.fn(),
    deleteAnswer: jest.fn(),
  }
  const postService = {
    getExistingTagsFromRequestTags: jest.fn(),
    getExistingTopicFromRequestTopic: jest.fn(),
    getExistingTopicsFromRequestTopics: jest.fn(),
    getChildTopicsFromRequestTopics: jest.fn(),
    listPosts: jest.fn(),
    listAnswerablePosts: jest.fn(),
    getSinglePost: jest.fn(),
    createPost: jest.fn(),
    deletePost: jest.fn(),
    updatePost: jest.fn(),
  }
  const webService = {
    getAgencyPage: jest.fn(),
    getQuestionPage: jest.fn(),
    getSitemapUrls: jest.fn(),
  }
  const indexStr =
    '<!doctype html><html lang="en"><head><meta charset="utf-8"/><link rel="icon" href="/favicon.ico"/><link rel="icon" type="image/svg+xml" href="/icon.svg"/><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/><link rel="manifest" href="/manifest.json"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" media="(prefers-color-scheme: light)" content="white"><meta name="theme-color" media="(prefers-color-scheme: dark)" content="black"><title>AskGov</title><meta name="description" content="Answers from the Singapore Government" data-rh="true"/><meta property="og:title" content="AskGov"/><meta property="og:description" content="Answers from the Singapore Government"/><meta property="og:image" content="/logo512.png"/><meta property="og:type" content="website"/><link rel="preconnect" href="https://fonts.gstatic.com"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&display=swap" rel="preload stylesheet" as="style" crossorigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap" rel="preload stylesheet" as="style" crossorigin="anonymous"/><link href="/static/css/2.8e4e8e1f.chunk.css" rel="stylesheet"><link href="/static/css/main.ef5a197a.chunk.css" rel="stylesheet"></head><body><div id="root"></div><script src="/static/js/runtime-main.7545a8a1.js"></script><script src="/static/js/2.e182fae7.chunk.js"></script><script src="/static/js/main.51d19d55.chunk.js"></script></body></html>'
  const index = Buffer.from(indexStr)

  beforeAll(async () => {
    db = await createTestDatabase()
    Answer = getModelDef<Answer>(db, ModelName.Answer)
    Post = getModelDef<Post, PostCreation>(db, ModelName.Post)
    Topic = getModelDef<Topic>(db, ModelName.Topic)
    User = getModelDef<User>(db, ModelName.User)
    Agency = getModelDef<Agency>(db, ModelName.Agency)

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
    mockAnswer = await Answer.create({
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

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await db.close()
  })

  describe('/agency/:shortname', () => {
    beforeEach(() => {
      agencyService.findOneByName.mockReset()
      webService.getAgencyPage.mockReset()
    })
    it('returns agency index file', async () => {
      const agencyPageIndex = `<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><link rel=\"icon\" href=\"/favicon.ico\"><link rel=\"icon\" type=\"image/svg+xml\" href=\"/icon.svg\"><link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"/favicon-32x32.png\"><link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"/favicon-16x16.png\"><link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"/apple-touch-icon.png\"><link rel=\"manifest\" href=\"/manifest.json\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"theme-color\" media=\"(prefers-color-scheme: light)\" content=\"white\"><meta name=\"theme-color\" media=\"(prefers-color-scheme: dark)\" content=\"black\"><title>${mockAgency.shortname} FAQ - AskGov</title><meta name=\"description\" content=\"Answers from ${mockAgency.longname} (${mockAgency.shortname})\" data-rh=\"true\"><meta property=\"og:title\" content=\"${mockAgency.shortname} FAQ - AskGov\"><meta property=\"og:description\" content=\"Answers from ${mockAgency.longname} (${mockAgency.shortname})\"><meta property=\"og:image\" content=\"/logo512.png\"><meta property=\"og:type\" content=\"website\"><link rel=\"preconnect\" href=\"https://fonts.gstatic.com\"><link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&amp;display=swap\" rel=\"preload stylesheet\" as=\"style\" crossorigin=\"anonymous\"><link href=\"https://fonts.googleapis.com/css2?family=Poppins:wght@600&amp;display=swap\" rel=\"preload stylesheet\" as=\"style\" crossorigin=\"anonymous\"><link href=\"/static/css/2.8e4e8e1f.chunk.css\" rel=\"stylesheet\"><link href=\"/static/css/main.ef5a197a.chunk.css\" rel=\"stylesheet\"></head><body><div id=\"root\"></div><script src=\"/static/js/runtime-main.7545a8a1.js\"></script><script src=\"/static/js/2.e182fae7.chunk.js\"></script><script src=\"/static/js/main.51d19d55.chunk.js\"></script></body></html>`
      agencyService.findOneByName.mockReturnValueOnce(okAsync(mockAgency))
      webService.getAgencyPage.mockReturnValueOnce(agencyPageIndex)

      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get(`/agency/${mockAgency.shortname}`)

      expect(webService.getAgencyPage).toHaveBeenCalledWith(
        index,
        mockAgency.shortname,
        mockAgency.longname,
      )
      expect(agencyService.findOneByName).toHaveBeenCalledWith({
        shortname: `${mockAgency.shortname}`,
      })

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.text).toEqual(agencyPageIndex)
    })

    it('returns MOVED_PERMANENTLY and redirects to not-found on invalid agency', async () => {
      agencyService.findOneByName.mockReturnValueOnce(
        errAsync(new MissingAgencyError()),
      )

      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get(`/agency/invalidagency`)

      expect(agencyService.findOneByName).toHaveBeenCalledWith({
        shortname: 'invalidagency',
      })

      expect(response.status).toEqual(StatusCodes.MOVED_PERMANENTLY)
      expect(response.text).toEqual(
        'Moved Permanently. Redirecting to /not-found',
      )
      expect(response.header.location).toEqual('/not-found')
    })

    it('returns INTERNAL_SERVER_ERROR when database error occurs while retrieving agency', async () => {
      agencyService.findOneByName.mockReturnValueOnce(
        errAsync(new DatabaseError()),
      )

      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get(`/agency/${mockAgency.shortname}`)

      expect(agencyService.findOneByName).toHaveBeenCalledWith({
        shortname: mockAgency.shortname,
      })

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
    })
  })

  describe('/questions/:id', () => {
    beforeEach(() => {
      postService.getSinglePost.mockReset()
      answersService.listAnswers.mockReset()
      webService.getQuestionPage.mockReset()
    })
    it('returns question index file', async () => {
      const sanitisedDescription = `This is an answer to post ${mockPost.id}.`
      const getQuestionPageIndex = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><link rel="icon" href="/favicon.ico"/><link rel="icon" type="image/svg+xml" href="/icon.svg"/><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/><link rel="manifest" href="/manifest.json"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" media="(prefers-color-scheme: light)" content="white"><meta name="theme-color" media="(prefers-color-scheme: dark)" content="black"><title>${mockPost.title} - AskGov</title><meta name="description" content="${sanitisedDescription}" data-rh="true"/><meta property="og:title" content="${mockPost.title} - AskGov"/><meta property="og:description" content="${sanitisedDescription}"/><meta property="og:image" content="/logo512.png"/><meta property="og:type" content="website"/><link rel="preconnect" href="https://fonts.gstatic.com"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&display=swap" rel="preload stylesheet" as="style" crossorigin="anonymous"/><link href="/static/css/2.8e4e8e1f.chunk.css" rel="stylesheet"><link href="/static/css/main.3762428d.chunk.css" rel="stylesheet"></head><body><div id="root"></div><script src="/static/js/runtime-main.7545a8a1.js"></script><script src="/static/js/2.aea750b1.chunk.js"></script><script src="/static/js/main.c22b20af.chunk.js"></script></body></html>`
      postService.getSinglePost.mockResolvedValueOnce(mockPost)
      answersService.listAnswers.mockResolvedValueOnce([mockAnswer])
      webService.getQuestionPage.mockReturnValueOnce(getQuestionPageIndex)

      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get(`/questions/${mockPost.id}`)

      expect(postService.getSinglePost).toHaveBeenCalledWith(
        mockPost.id,
        0,
        false,
      )
      expect(answersService.listAnswers).toHaveBeenCalledWith(mockPost.id)
      expect(webService.getQuestionPage).toHaveBeenCalledWith(
        index,
        mockPost.title,
        sanitisedDescription,
      )

      expect(response.statusCode).toEqual(StatusCodes.OK)
      expect(response.text).toStrictEqual(getQuestionPageIndex)
    })

    it('returns BAD_REQUEST when post id is not number', async () => {
      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get(`/questions/postIdNotNum`)

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    })

    it('returns MOVED_PERMANENTLY and redirects to not-found when postService.getSinglePost throws MissingPublicPostError', async () => {
      postService.getSinglePost.mockRejectedValueOnce(
        new MissingPublicPostError(),
      )
      answersService.listAnswers.mockResolvedValueOnce([mockAnswer])

      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get(`/questions/100`)

      expect(postService.getSinglePost).toHaveBeenCalledWith(100, 0, false)
      expect(answersService.listAnswers).toHaveBeenCalledWith(100)

      expect(response.statusCode).toEqual(StatusCodes.MOVED_PERMANENTLY)
      expect(response.text).toEqual(
        'Moved Permanently. Redirecting to /not-found',
      )
      expect(response.header.location).toEqual('/not-found')
    })

    it('returns MOVED_PERMANENTLY and redirects to not-found if post has no answers', async () => {
      postService.getSinglePost.mockResolvedValueOnce(mockPost)
      answersService.listAnswers.mockResolvedValueOnce([])

      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get(
        `/questions/${mockPostWithNoAnswers.id}`,
      )

      expect(postService.getSinglePost).toHaveBeenCalledWith(
        mockPostWithNoAnswers.id,
        0,
        false,
      )
      expect(answersService.listAnswers).toHaveBeenCalledWith(
        mockPostWithNoAnswers.id,
      )

      expect(response.statusCode).toEqual(StatusCodes.MOVED_PERMANENTLY)
      expect(response.text).toEqual(
        'Moved Permanently. Redirecting to /not-found',
      )
      expect(response.header.location).toEqual('/not-found')
    })

    it('returns INTERNAL_SERVER_ERROR when listAnswers cannot find post', async () => {
      postService.getSinglePost.mockResolvedValueOnce(mockPost)
      answersService.listAnswers.mockRejectedValueOnce(new DatabaseError())

      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get(`/questions/${mockPost.id}`)

      expect(postService.getSinglePost).toHaveBeenCalledWith(
        mockPost.id,
        0,
        false,
      )
      expect(answersService.listAnswers).toHaveBeenCalledWith(mockPost.id)

      expect(response.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
    })
  })

  describe('/sitemap.xml', () => {
    const sitemapLeaves: SitemapLeaf[] = [
      { url: '/', lastMod: true },
      { url: '/terms', lastMod: true },
      { url: '/privacy', lastMod: true },
      { url: '/questions/1', lastMod: true },
      { url: '/questions/2', lastMod: true },
      { url: '/agency/L', lastMod: true },
    ]
    const getSitemapUrlMockImplementation = (
      allPosts: Post[],
      allAgencies: Agency[],
    ): SitemapLeaf[] => {
      if (allPosts.length === 0 && allAgencies.length === 0)
        return [
          { url: '/', lastMod: true },
          { url: '/terms', lastMod: true },
          { url: '/privacy', lastMod: true },
        ]
      else return sitemapLeaves
    }
    beforeEach(() => {
      postService.listPosts.mockReset()
      agencyService.listAgencyShortNames.mockReset()
      webService.getSitemapUrls.mockReset()
    })
    it('returns sitemap xml file', async () => {
      postService.listPosts.mockResolvedValueOnce({
        posts: [mockPost],
        totalItems: 1,
      })
      agencyService.listAgencyShortNames.mockReturnValueOnce(
        okAsync(mockAgency),
      )
      webService.getSitemapUrls.mockImplementationOnce(
        getSitemapUrlMockImplementation,
      )

      const lastModDate = new Date().toISOString().split('T')[0]
      const expectedSitemap = `<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://ask.gov.sg/</loc>\n    <lastmod>${lastModDate}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/terms</loc>\n    <lastmod>${lastModDate}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/privacy</loc>\n    <lastmod>${lastModDate}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/questions/1</loc>\n    <lastmod>${lastModDate}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/questions/2</loc>\n    <lastmod>${lastModDate}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/agency/${mockAgency.shortname}</loc>\n    <lastmod>${lastModDate}</lastmod>\n  </url>\n</urlset>`
      const app = express()
      app.use('/', routeWeb({ controller: webController }))
      const request = supertest(app)
      const response = await request.get('/sitemap.xml')

      expect(postService.listPosts).toBeCalledWith({
        sort: SortType.Top,
        tags: [],
        topics: [],
        agencyId: 0,
      })
      expect(agencyService.listAgencyShortNames).toBeCalledWith()
      expect(webService.getSitemapUrls).toBeCalledWith([mockPost], mockAgency)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.text).toEqual(expectedSitemap)
    })
  })
})
