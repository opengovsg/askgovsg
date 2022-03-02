import { ComponentStory, ComponentMeta } from '@storybook/react'
import { rest } from 'msw'
import { MockSearchData, MockTopicData } from '../../__mocks__/mockData'
import SearchResults from './SearchResults.component'

export default {
  title: 'Pages/SearchResults',
  component: SearchResults,
  parameters: {
    msw: {
      handlers: {
        search: [
          rest.get('/api/v1/search', (_req, res, ctx) => {
            return res(ctx.json(MockSearchData))
          }),
        ],
        topics: [
          rest.get('/api/v1/topics', (_req, res, ctx) => {
            return res(ctx.json(MockTopicData))
          }),
        ],
      },
    },
  },
} as ComponentMeta<typeof SearchResults>

const Template: ComponentStory<typeof SearchResults> = () => <SearchResults />

export const Default = Template.bind({})
export const NoResults = Template.bind({})
NoResults.parameters = {
  msw: {
    handlers: {
      search: [
        rest.get('/api/v1/search', (_req, res, ctx) => {
          return res(ctx.json([]))
        }),
      ],
    },
  },
}
