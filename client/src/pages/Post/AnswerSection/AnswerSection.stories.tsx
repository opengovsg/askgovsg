import { ComponentMeta, ComponentStory } from '@storybook/react'

import { MockAnswerData } from '../../../__mocks__/mockData'

import AnswerSection from './AnswerSection.component'

export default {
  title: 'Pages/Post/AnswerSection/AnswerSection',
  component: AnswerSection,
} as ComponentMeta<typeof AnswerSection>

const Template: ComponentStory<typeof AnswerSection> = (args) => (
  <AnswerSection {...args} />
)

export const Default = Template.bind({})
Default.args = {
  answers: MockAnswerData,
}
export const NoAnswers = Template.bind({})
NoAnswers.args = {
  answers: [],
}
