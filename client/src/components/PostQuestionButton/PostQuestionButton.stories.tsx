import { ComponentStory, ComponentMeta } from '@storybook/react'
import PostQuestionButton from './PostQuestionButton.component'

export default {
  title: 'Components/Buttons/PostQuestionButton',
  component: PostQuestionButton,
} as ComponentMeta<typeof PostQuestionButton>

const Template: ComponentStory<typeof PostQuestionButton> = () => (
  <PostQuestionButton />
)

export const Default = Template.bind({})
