import { Button, Text } from '@chakra-ui/react'
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
  sort: 'basic',
  agencyId: 1,
  topics: 'financial support',
  pageSize: 10,
  listAnswerable: true,
  footerControl: (
    <Button
      mt={{ base: '40px', sm: '48px', xl: '58px' }}
      variant="outline"
      color="secondary.700"
      borderColor="secondary.700"
      onClick={() => {
        window.scrollTo(0, 0)
      }}
    >
      <Text textStyle="subhead-1">View all questions</Text>
    </Button>
  ),
}
