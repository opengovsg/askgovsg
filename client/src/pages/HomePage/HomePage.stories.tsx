import { ComponentStory, ComponentMeta } from '@storybook/react'
import { rest } from 'msw'
import HomePage from './HomePage.component'
import {
  MockAgencyShortNameData,
  MockPostData,
  MockTopicData,
  MockUserData,
} from '../../__mocks__/mockData'

export default {
  title: 'Pages/HomePage',
  component: HomePage,
  parameters: {
    msw: {
      handlers: {
        topics: [
          rest.get('/api/v1/topics', (_req, res, ctx) => {
            return res(ctx.json(MockTopicData))
          }),
        ],
        posts: [
          rest.get('/api/v1/posts', (_req, res, ctx) => {
            return res(ctx.json(MockPostData))
          }),
        ],
        answerable: [
          rest.get('/api/v1/posts/answerable', (_req, res, ctx) => {
            return res(ctx.json(MockPostData))
          }),
        ],
        auth: [
          rest.get('/api/v1/auth', (_req, res, ctx) => {
            return res(ctx.json(MockUserData))
          }),
        ],
        agency: [
          rest.get('/api/v1/agencies/shortnames', (_req, res, ctx) => {
            return res(ctx.json(MockAgencyShortNameData))
          }),
        ],
      },
    },
  },
} as ComponentMeta<typeof HomePage>

const Template: ComponentStory<typeof HomePage> = () => <HomePage />

export const LoggedIn = Template.bind({})
export const LoggedOut = Template.bind({})
LoggedOut.parameters = {
  msw: {
    handlers: {
      auth: [
        rest.get('/api/v1/auth', (_req, res, ctx) => {
          return res(ctx.status(401))
        }),
      ],
    },
  },
}
