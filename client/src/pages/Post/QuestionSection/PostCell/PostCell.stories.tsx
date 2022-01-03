import { ComponentStory, ComponentMeta } from '@storybook/react'
import PostCell from './PostCell.component'

export default {
  title: 'Pages/Post/QuestionSection/PostCell',
  component: PostCell,
  args: {
    post: {
      description: 'The answer is ...',
    },
  },
} as ComponentMeta<typeof PostCell>

const Template: ComponentStory<typeof PostCell> = (args) => (
  <PostCell {...args} />
)

export const Default = Template.bind({})
