import { ComponentStory, ComponentMeta } from '@storybook/react'
import { rest } from 'msw'
import { MockPostData } from '../../__mocks__/mockData'
import PostList from './PostList.component'

export default {
  title: 'Components/Posts/PostList',
  component: PostList,
  parameters: {
    msw: {
      handlers: {
        posts: [
          rest.get('/api/v1/posts/answerable/*', (_req, res, ctx) => {
            return res(ctx.json(MockPostData))
          }),
        ],
      },
    },
  },
} as ComponentMeta<typeof PostList>

const Template: ComponentStory<typeof PostList> = (args) => (
  <PostList {...args} />
)

export const Default = Template.bind({})
Default.args = {
  posts: MockPostData.posts,
}
