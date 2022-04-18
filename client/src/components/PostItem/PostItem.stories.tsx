import { ComponentMeta, ComponentStory } from '@storybook/react'

import PostItem from './PostItem.component'

export default {
  title: 'Components/Posts/PostItem',
  component: PostItem,
} as ComponentMeta<typeof PostItem>

const Template: ComponentStory<typeof PostItem> = (args) => (
  <PostItem {...args} />
)

export const Default = Template.bind({})
Default.args = {
  post: { id: 1, title: 'PostItem Title', tags: [], agencyId: 9 },
}
