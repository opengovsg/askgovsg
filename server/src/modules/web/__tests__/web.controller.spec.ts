import express from 'express'
import expressSitemapXml, { SitemapLeaf } from 'express-sitemap-xml'
import { param } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { errAsync, okAsync } from 'neverthrow'
import { Model, ModelCtor, Sequelize } from 'sequelize'
import supertest from 'supertest'
import {
  Agency as AgencyType,
  Post as PostType,
  PostStatus,
} from '~shared/types/base'
import { baseConfig } from '../../../bootstrap/config/base'
import { Answer as AnswerModel, User as UserModel } from '../../../models'
import { SortType } from '../../../types/sort-type'
import { createTestDatabase, getModel, ModelName } from '../../../util/jest-db'
import { MissingAgencyError } from '../../agency/agency.errors'
import { DatabaseError } from '../../core/core.errors'
import {
  InvalidTagsError,
  MissingPublicPostError,
} from '../../post/post.errors'
import { WebController } from '../web.controller'

describe('WebController', () => {
  const agencyService = {
    findOneByName: jest.fn(),
    findOneById: jest.fn(),
    listAgencyShortNames: jest.fn(),
    listAllAgencies: jest.fn(),
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
    getPostsByTopic: jest.fn(),
  }
  const webService = {
    getAgencyPage: jest.fn(),
    getQuestionPage: jest.fn(),
    getSitemapUrls: jest.fn(),
  }
  const indexStr =
    '<!doctype html><html lang="en"><head><meta charset="utf-8"/><link rel="icon" href="/favicon.ico"/><link rel="icon" type="image/svg+xml" href="/icon.svg"/><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/><link rel="manifest" href="/manifest.json"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" media="(prefers-color-scheme: light)" content="white"><meta name="theme-color" media="(prefers-color-scheme: dark)" content="black"><title>AskGov</title><meta name="description" content="Answers from the Singapore Government" data-rh="true"/><meta property="og:title" content="AskGov"/><meta property="og:description" content="Answers from the Singapore Government"/><meta property="og:image" content="/logo512.png"/><meta property="og:type" content="website"/><link rel="preconnect" href="https://fonts.gstatic.com"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&display=swap" rel="preload stylesheet" as="style" crossorigin="anonymous"/><link href="/static/css/2.8e4e8e1f.chunk.css" rel="stylesheet"><link href="/static/css/main.3762428d.chunk.css" rel="stylesheet"></head><body><div id="root"></div><script src="/static/js/runtime-main.7545a8a1.js"></script><script src="/static/js/2.aea750b1.chunk.js"></script><script src="/static/js/main.c22b20af.chunk.js"></script></body></html>'
  const index = Buffer.from(indexStr)

  const webController = new WebController({
    agencyService,
    answersService,
    postService,
    webService,
    index,
  })

  let db: Sequelize

  const mockAgencies: AgencyType[] = []
  const mockPosts: PostType[] = []

  let Post: ModelCtor<PostType & Model>
  let Agency: ModelCtor<AgencyType & Model>
  let User: ModelCtor<UserModel>
  let Answer: ModelCtor<AnswerModel>

  let mockUser: UserModel
  let mockAnswer: AnswerModel

  beforeAll(async () => {
    db = await createTestDatabase()
    Post = getModel<PostType & Model>(db, ModelName.Post)
    Agency = getModel<AgencyType & Model>(db, ModelName.Agency)
    User = getModel<UserModel>(db, ModelName.User)
    Answer = getModel<AnswerModel>(db, ModelName.Answer)

    mockUser = await User.create({
      username: 'answerer@test.gov.sg',
      displayname: '',
    })

    for (let i = 1; i < 3; i++) {
      const mockPost = await Post.create({
        title: i.toString(),
        status: PostStatus.Public,
        userId: mockUser.id,
      })
      mockPosts.push(mockPost)
      const mockAgency = await Agency.create({
        shortname: `shortname${i}`,
        longname: `longname${i}`,
        email: `enquiries${i}@ask.gov.sg`,
        logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
        noEnquiriesMessage: null,
        website: null,
        displayOrder: null,
      })
      mockAgencies.push(mockAgency)
    }

    mockAnswer = await Answer.create({
      body: '<p>This is an answer to the question.</p>',
      username: 'username',
      userId: mockUser.id,
      agencyLogo: 'logo.svg',
      postId: mockPosts[0].id,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => await db.close())

  describe('getAgencyPage', () => {
    beforeEach(() => {
      agencyService.findOneByName.mockReset()
      webService.getAgencyPage.mockReset()
    })

    it('returns OK on a valid query', async () => {
      const agencyPageIndex = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><link rel="icon" href="/favicon.ico"/><link rel="icon" type="image/svg+xml" href="/icon.svg"/><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/><link rel="manifest" href="/manifest.json"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" media="(prefers-color-scheme: light)" content="white"><meta name="theme-color" media="(prefers-color-scheme: dark)" content="black"><title>${mockAgencies[0].shortname.toUpperCase()}</title><meta name="description" content="Answers from ${
        mockAgencies[0].longname
      } (${mockAgencies[0].shortname.toUpperCase()})" data-rh="true"/><meta property="og:title" content="${mockAgencies[0].shortname.toUpperCase()}"/><meta property="og:description" content="Answers from ${
        mockAgencies[0].longname
      } (${mockAgencies[0].shortname.toUpperCase()})"/><meta property="og:image" content="/logo512.png"/><meta property="og:type" content="website"/><link rel="preconnect" href="https://fonts.gstatic.com"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&display=swap" rel="preload stylesheet" as="style" crossorigin="anonymous"/><link href="/static/css/2.8e4e8e1f.chunk.css" rel="stylesheet"><link href="/static/css/main.3762428d.chunk.css" rel="stylesheet"></head><body><div id="root"></div><script src="/static/js/runtime-main.7545a8a1.js"></script><script src="/static/js/2.aea750b1.chunk.js"></script><script src="/static/js/main.c22b20af.chunk.js"></script></body></html>`

      agencyService.findOneByName.mockReturnValueOnce(okAsync(mockAgencies[0]))
      webService.getAgencyPage.mockReturnValueOnce(agencyPageIndex)

      const app = express()
      app.get('/agency/:shortname', webController.getAgencyPage)
      const request = supertest(app)
      const response = await request.get(`/agency/${mockAgencies[0].shortname}`)

      expect(webService.getAgencyPage).toHaveBeenCalledWith(
        index,
        mockAgencies[0].shortname,
        mockAgencies[0].longname,
      )
      expect(agencyService.findOneByName).toHaveBeenCalledWith({
        shortname: mockAgencies[0].shortname,
      })

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.text).toStrictEqual(agencyPageIndex)
    })

    it('returns MOVED_PERMANENTLY status when agency does not exist', async () => {
      agencyService.findOneByName.mockReturnValueOnce(
        errAsync(new MissingAgencyError()),
      )

      const app = express()
      app.get('/agency/:shortname', webController.getAgencyPage)
      const request = supertest(app)

      const agencyShortname = 'not'
      const response = await request.get(`/agency/${agencyShortname}`)

      expect(agencyService.findOneByName).toHaveBeenCalledWith({
        shortname: agencyShortname,
      })
      expect(response.status).toEqual(StatusCodes.MOVED_PERMANENTLY)
    })

    it('returns INTERNAL_SERVER_ERROR when database error occurs while retrieving agency', async () => {
      agencyService.findOneByName.mockReturnValue(errAsync(new DatabaseError()))

      const app = express()
      app.get('/agency/:shortname', webController.getAgencyPage)
      const request = supertest(app)

      const agencyShortname = 'not'
      const response = await request.get(`/agency/${agencyShortname}`)

      expect(agencyService.findOneByName).toHaveBeenCalledWith({
        shortname: agencyShortname,
      })
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
    })
  })

  describe('getQuestionPage', () => {
    beforeEach(() => {
      postService.getSinglePost.mockReset()
      answersService.listAnswers.mockReset()
      webService.getQuestionPage.mockReset()
    })

    it('returns OK on a valid query', async () => {
      const sanitisedDescription = 'This is an answer to the question.'
      const getQuestionPageIndex = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><link rel="icon" href="/favicon.ico"/><link rel="icon" type="image/svg+xml" href="/icon.svg"/><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/><link rel="manifest" href="/manifest.json"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" media="(prefers-color-scheme: light)" content="white"><meta name="theme-color" media="(prefers-color-scheme: dark)" content="black"><title>${mockPosts[0].title} - AskGov</title><meta name="description" content="${sanitisedDescription}" data-rh="true"/><meta property="og:title" content="${mockPosts[0].title} - AskGov"/><meta property="og:description" content="${sanitisedDescription}"/><meta property="og:image" content="/logo512.png"/><meta property="og:type" content="website"/><link rel="preconnect" href="https://fonts.gstatic.com"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&display=swap" rel="preload stylesheet" as="style" crossorigin="anonymous"/><link href="/static/css/2.8e4e8e1f.chunk.css" rel="stylesheet"><link href="/static/css/main.3762428d.chunk.css" rel="stylesheet"></head><body><div id="root"></div><script src="/static/js/runtime-main.7545a8a1.js"></script><script src="/static/js/2.aea750b1.chunk.js"></script><script src="/static/js/main.c22b20af.chunk.js"></script></body></html>`

      postService.getSinglePost.mockResolvedValueOnce(mockPosts[0])
      answersService.listAnswers.mockResolvedValueOnce([mockAnswer])
      webService.getQuestionPage.mockReturnValueOnce(getQuestionPageIndex)

      const app = express()
      app.get(
        '/questions/:id',
        [param('id').isInt().toInt()],
        webController.getQuestionPage,
      )
      const request = supertest(app)
      const response = await request.get(`/questions/${mockPosts[0].id}`)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.text).toStrictEqual(getQuestionPageIndex)
      expect(postService.getSinglePost).toHaveBeenCalledWith(
        mockPosts[0].id,
        0,
        false,
      )
      expect(answersService.listAnswers).toHaveBeenCalledWith(mockPosts[0].id)
      expect(webService.getQuestionPage).toHaveBeenCalledWith(
        index,
        mockPosts[0].title,
        sanitisedDescription,
      )
    })

    it('returns BAD REQUEST when id is not a number', async () => {
      const app = express()
      app.get(
        '/questions/:id',
        [param('id').isInt().toInt()],
        webController.getQuestionPage,
      )
      const request = supertest(app)
      const response = await request.get(`/questions/string`)

      expect(response.status).toEqual(StatusCodes.BAD_REQUEST)
      expect(response.body).toEqual(index)
    })

    it('returns MOVED PERMANENTLY when postService.getSinglePost throws MissingPublicPostError', async () => {
      answersService.listAnswers.mockResolvedValueOnce([mockAnswer])
      postService.getSinglePost.mockRejectedValueOnce(
        new MissingPublicPostError(),
      )

      const app = express()
      app.get(
        '/questions/:id',
        [param('id').isInt().toInt()],
        webController.getQuestionPage,
      )
      const request = supertest(app)

      const response = await request.get(`/questions/${mockPosts[0].id}`)

      expect(postService.getSinglePost).toHaveBeenCalledWith(
        mockPosts[0].id,
        0,
        false,
      )
      expect(answersService.listAnswers).toHaveBeenCalledWith(mockPosts[0].id)

      expect(response.status).toEqual(StatusCodes.MOVED_PERMANENTLY)
    })

    it('returns INTERNAL SERVER ERROR when listAnswers cannot find post', async () => {
      postService.getSinglePost.mockResolvedValueOnce(mockPosts[0])
      answersService.listAnswers.mockRejectedValueOnce(new DatabaseError())

      const app = express()
      app.get(
        '/questions/:id',
        [param('id').isInt().toInt()],
        webController.getQuestionPage,
      )
      const request = supertest(app)

      const response = await request.get(`/questions/${mockPosts[0].id}`)

      expect(postService.getSinglePost).toHaveBeenCalledWith(
        mockPosts[0].id,
        0,
        false,
      )
      expect(answersService.listAnswers).toHaveBeenCalledWith(mockPosts[0].id)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
    })

    it('returns MOVED PERMANENTLY when no answers are found for the question', async () => {
      postService.getSinglePost.mockResolvedValueOnce(mockPosts[0])
      answersService.listAnswers.mockResolvedValueOnce([])

      const app = express()
      app.get(
        '/questions/:id',
        [param('id').isInt().toInt()],
        webController.getQuestionPage,
      )
      const request = supertest(app)

      const response = await request.get(`/questions/${mockPosts[1].id}`)

      expect(response.status).toEqual(StatusCodes.MOVED_PERMANENTLY)
      expect(postService.getSinglePost).toHaveBeenCalledWith(
        mockPosts[1].id,
        0,
        false,
      )
      expect(answersService.listAnswers).toHaveBeenCalledWith(mockPosts[1].id)
    })
  })

  describe('getSitemapUrls', () => {
    const sitemapLeaves: SitemapLeaf[] = [
      { url: '/', lastMod: true },
      { url: '/terms', lastMod: true },
      { url: '/privacy', lastMod: true },
      { url: '/questions/1', lastMod: true },
      { url: '/questions/2', lastMod: true },
      { url: '/agency/shortname1', lastMod: true },
      { url: '/agency/shortname2', lastMod: true },
    ]
    const sitemapEndpoint = '/sitemap.xml'
    const lastModStr = new Date().toISOString().split('T')[0]
    const getSitemapUrlMockImplementation = (
      allPosts: PostType[],
      allAgencies: AgencyType[],
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

    it('returns OK on a valid query', async () => {
      postService.listPosts.mockResolvedValueOnce({
        posts: mockPosts,
        totalItems: mockPosts.length,
      })
      agencyService.listAgencyShortNames.mockReturnValueOnce(
        okAsync(mockAgencies),
      )
      webService.getSitemapUrls.mockImplementationOnce(
        getSitemapUrlMockImplementation,
      )

      const app = express()
      app.use(
        expressSitemapXml(webController.getSitemapUrls, baseConfig.hostUrl),
      )
      const request = supertest(app)

      const expectedSitemap = `<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://ask.gov.sg/</loc>\n    <lastmod>${lastModStr}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/terms</loc>\n    <lastmod>${lastModStr}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/privacy</loc>\n    <lastmod>${lastModStr}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/questions/1</loc>\n    <lastmod>${lastModStr}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/questions/2</loc>\n    <lastmod>${lastModStr}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/agency/shortname1</loc>\n    <lastmod>${lastModStr}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/agency/shortname2</loc>\n    <lastmod>${lastModStr}</lastmod>\n  </url>\n</urlset>`
      const response = await request.get(sitemapEndpoint)

      expect(postService.listPosts).toBeCalledWith({
        sort: SortType.Top,
        tags: [],
        topics: [],
        agencyId: 0,
      })
      expect(agencyService.listAgencyShortNames).toBeCalledWith()
      expect(webService.getSitemapUrls).toBeCalledWith(mockPosts, mockAgencies)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.text).toEqual(expectedSitemap)
    })

    it('returns sitemap xml with static paths when postService.listPosts throws Error', async () => {
      postService.listPosts.mockRejectedValueOnce(new InvalidTagsError())
      agencyService.listAgencyShortNames.mockReturnValueOnce(
        okAsync(mockAgencies),
      )
      webService.getSitemapUrls.mockImplementationOnce(
        getSitemapUrlMockImplementation,
      )

      const expectedSitemap = `<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://ask.gov.sg/</loc>\n    <lastmod>${lastModStr}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/terms</loc>\n    <lastmod>${lastModStr}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/privacy</loc>\n    <lastmod>${lastModStr}</lastmod>\n  </url>\n</urlset>`

      const app = express()
      app.use(
        expressSitemapXml(webController.getSitemapUrls, baseConfig.hostUrl),
      )
      const request = supertest(app)
      const response = await request.get(sitemapEndpoint)

      expect(postService.listPosts).toBeCalledWith({
        sort: SortType.Top,
        tags: [],
        topics: [],
        agencyId: 0,
      })
      expect(agencyService.listAgencyShortNames).toBeCalledWith()
      expect(webService.getSitemapUrls).toBeCalledWith([], [])

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.text).toEqual(expectedSitemap)
    })

    it('returns sitemap xml with static paths when Database Error occurs while retrieving agencies', async () => {
      postService.listPosts.mockResolvedValueOnce({
        posts: mockPosts,
        totalItems: mockPosts.length,
      })
      agencyService.listAgencyShortNames.mockReturnValueOnce(
        errAsync(new MissingAgencyError()),
      )
      webService.getSitemapUrls.mockImplementationOnce(
        getSitemapUrlMockImplementation,
      )

      const expectedSitemap = `<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://ask.gov.sg/</loc>\n    <lastmod>${lastModStr}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/terms</loc>\n    <lastmod>${lastModStr}</lastmod>\n  </url>\n  <url>\n    <loc>https://ask.gov.sg/privacy</loc>\n    <lastmod>${lastModStr}</lastmod>\n  </url>\n</urlset>`

      const app = express()
      app.use(
        expressSitemapXml(webController.getSitemapUrls, baseConfig.hostUrl),
      )
      const request = supertest(app)
      const response = await request.get(sitemapEndpoint)

      expect(postService.listPosts).toBeCalledWith({
        sort: SortType.Top,
        tags: [],
        topics: [],
        agencyId: 0,
      })
      expect(agencyService.listAgencyShortNames).toBeCalledWith()
      expect(webService.getSitemapUrls).toBeCalledWith([], [])

      // status should be OK because errors cannot be used for input to expressSitemapXml which serves the sitemap.xml file
      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.text).toEqual(expectedSitemap)
    })
  })
})
