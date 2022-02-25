import { rest } from 'msw'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import QuestionsList from './QuestionsList.component'
import { MockPostData } from '../../__mocks__/mockData'

export default {
  title: 'Components/Posts/QuestionsList',
  component: QuestionsList,
  parameters: {
    msw: {
      handlers: {
        posts: [
          rest.get('/api/v1/posts/answerable', (_req, res, ctx) => {
            return res(ctx.json(MockPostData))
          }),
        ],
      },
    },
  },
} as ComponentMeta<typeof QuestionsList>

const Template: ComponentStory<typeof QuestionsList> = (args) => (
  <QuestionsList {...args} />
)

export const Default = Template.bind({})
Default.args = {
  sort: 'basic',
  agencyId: 1,
  topics: 'financial support',
  questionsPerPage: 10,
  listAnswerable: true,
  showViewAllQuestionsButton: true,
}
