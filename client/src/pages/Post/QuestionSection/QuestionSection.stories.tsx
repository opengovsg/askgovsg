import { ComponentMeta, ComponentStory } from '@storybook/react'

import QuestionSection from './QuestionSection.component'

export default {
  title: 'Pages/Post/QuestionSection/QuestionSection',
  component: QuestionSection,
  args: {
    post: {
      description: 'The answer is ...',
    },
  },
} as ComponentMeta<typeof QuestionSection>

const Template: ComponentStory<typeof QuestionSection> = (args) => (
  <QuestionSection {...args} />
)

export const Default = Template.bind({})
