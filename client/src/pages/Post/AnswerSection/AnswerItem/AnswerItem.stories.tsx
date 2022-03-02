import { ComponentStory, ComponentMeta } from '@storybook/react'
import AnswerItem from './AnswerItem.component'

export default {
  title: 'Pages/Post/AnswerSection/AnswerItem',
  component: AnswerItem,
} as ComponentMeta<typeof AnswerItem>

const Template: ComponentStory<typeof AnswerItem> = (args) => (
  <AnswerItem {...args} />
)

export const Default = Template.bind({})
Default.args = {
  answer: {
    body: 'The answer is ...',
  },
}
