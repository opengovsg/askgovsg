import { ComponentMeta, ComponentStory } from '@storybook/react'
import { rest } from 'msw'

import { MockPostData } from '../../__mocks__/mockData'

import QuestionsList from './QuestionsList.component'

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
  agencyId: 1,
  questionsPerPage: 10,
  listAnswerable: true,
  showViewAllQuestionsButton: true,
}
