/**
 * @jest-environment jsdom
 */

import { SitemapLeaf } from 'express-sitemap-xml'
import { Model, Sequelize } from 'sequelize'
import {
  Agency as AgencyType,
  Post as PostType,
  PostStatus,
} from '~shared/types/base'
import { User as UserModel } from '../../../models'
import { createTestDatabase, getModel, ModelName } from '../../../util/jest-db'
import { WebService } from '../web.service'

describe('WebService', () => {
  const webService: WebService = new WebService()

  let db: Sequelize

  const indexStr =
    '<!doctype html><html lang="en"><head><meta charset="utf-8"/><link rel="icon" href="/favicon.ico"/><link rel="icon" type="image/svg+xml" href="/icon.svg"/><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/><link rel="manifest" href="/manifest.json"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" media="(prefers-color-scheme: light)" content="white"><meta name="theme-color" media="(prefers-color-scheme: dark)" content="black"><title>AskGov</title><meta name="description" content="Answers from the Singapore Government" data-rh="true"/><meta property="og:title" content="AskGov"/><meta property="og:description" content="Answers from the Singapore Government"/><meta property="og:image" content="/logo512.png"/><meta property="og:type" content="website"/><link rel="preconnect" href="https://fonts.gstatic.com"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&display=swap" rel="preload stylesheet" as="style" crossorigin="anonymous"/><link href="/static/css/2.8e4e8e1f.chunk.css" rel="stylesheet"><link href="/static/css/main.3762428d.chunk.css" rel="stylesheet"></head><body><div id="root"></div><script src="/static/js/runtime-main.7545a8a1.js"></script><script src="/static/js/2.aea750b1.chunk.js"></script><script src="/static/js/main.c22b20af.chunk.js"></script></body></html>'
  const index = Buffer.from(indexStr)

  describe('getAgencyPage', () => {
    it('should return correctly modified agency index', () => {
      const agencyShortname = 'agency_shortname'
      const agencyLongname = 'agency_longname'

      const result = webService.getAgencyPage(
        index,
        agencyShortname,
        agencyLongname,
      )

      const newNode = document.createElement('div')
      newNode.innerHTML = result

      expect(newNode.querySelector('title')).not.toEqual(expect.anything)
      expect(newNode.querySelector('title')!.innerHTML).toBe(
        `${agencyShortname.toUpperCase()} FAQ - AskGov`,
      )

      expect(newNode.querySelector('meta[property="og:title"]')).not.toEqual(
        expect.anything,
      )
      expect(
        newNode
          .querySelector('meta[property="og:title"]')!
          .getAttribute('content'),
      ).toBe(`${agencyShortname.toUpperCase()} FAQ - AskGov`)

      expect(newNode.querySelector('meta[name="description"]')).not.toEqual(
        expect.anything,
      )
      expect(
        newNode
          .querySelector('meta[name="description"]')!
          .getAttribute('content'),
      ).toBe(
        `Answers from ${agencyLongname} (${agencyShortname.toUpperCase()})`,
      )

      expect(
        newNode.querySelector('meta[property="og:description"]'),
      ).not.toEqual(expect.anything)
      expect(
        newNode
          .querySelector('meta[property="og:description"]')!
          .getAttribute('content'),
      ).toBe(
        `Answers from ${agencyLongname} (${agencyShortname.toUpperCase()})`,
      )
    })
  })

  describe('getQuestionPage', () => {
    it('should return correctly modified post index', () => {
      const postTitle = 'post_title'
      const postDescription = 'post_description'

      const result = webService.getQuestionPage(
        index,
        postTitle,
        postDescription,
      )

      const newNode = document.createElement('div')
      newNode.innerHTML = result

      expect(newNode.querySelector('title')).not.toEqual(expect.anything)
      expect(newNode.querySelector('title')!.innerHTML).toBe(
        `${postTitle} - AskGov`,
      )

      expect(newNode.querySelector('meta[property="og:title"]')).not.toEqual(
        expect.anything,
      )
      expect(
        newNode
          .querySelector('meta[property="og:title"]')!
          .getAttribute('content'),
      ).toBe(`${postTitle} - AskGov`)

      expect(newNode.querySelector('meta[name="description"]')).not.toEqual(
        expect.anything,
      )
      expect(
        newNode
          .querySelector('meta[name="description"]')!
          .getAttribute('content'),
      ).toBe(`${postDescription}`)

      expect(
        newNode.querySelector('meta[property="og:description"]'),
      ).not.toEqual(expect.anything)
      expect(
        newNode
          .querySelector('meta[property="og:description"]')!
          .getAttribute('content'),
      ).toBe(`${postDescription}`)

      expect(newNode.querySelector('meta[property="og:type"]')).not.toEqual(
        expect.anything,
      )
      expect(
        newNode
          .querySelector('meta[property="og:type"]')!
          .getAttribute('content'),
      ).toBe('article')
    })
  })

  describe('getSitemapUrls', () => {
    it('should return correctly modified post index', async () => {
      db = await createTestDatabase()
      const mockPosts: PostType[] = []
      const mockAgencies: AgencyType[] = []

      const Post = getModel<PostType & Model>(db, ModelName.Post)
      const Agency = getModel<AgencyType & Model>(db, ModelName.Agency)
      const User = getModel<UserModel>(db, ModelName.User)

      const mockUser = await User.create({
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

      const expectedResult: SitemapLeaf[] = [
        {
          url: '/',
          lastMod: true,
        },
        {
          url: '/terms',
          lastMod: true,
        },
        {
          url: '/privacy',
          lastMod: true,
        },
        {
          url: '/agency/shortname1',
          lastMod: true,
        },
        {
          url: '/agency/shortname2',
          lastMod: true,
        },
        {
          url: '/questions/1',
          lastMod: true,
        },
        {
          url: '/questions/2',
          lastMod: true,
        },
      ]

      const result = webService.getSitemapUrls(mockPosts, mockAgencies)

      expect(result.length).toStrictEqual(
        mockPosts.length + mockAgencies.length + 3,
      )
      expect(result).toEqual(expect.arrayContaining(expectedResult))

      jest.clearAllMocks()

      await db.close()
    })
  })
})
