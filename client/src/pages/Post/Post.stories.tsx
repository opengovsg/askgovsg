// TODO: fix compatibility issue with useParams
// stories and related questions not loading
import { ComponentStory, ComponentMeta } from '@storybook/react'
import Post from './Post.component'

export default {
  title: 'Pages/Post/Post',
  component: Post,
} as ComponentMeta<typeof Post>

const Template: ComponentStory<typeof Post> = () => <Post />

export const Default = Template.bind({})
