import { ComponentMeta, ComponentStory } from '@storybook/react'

import AskForm from './AskForm.component'

export default {
  title: 'Pages/AskForm',
  component: AskForm,
} as ComponentMeta<typeof AskForm>

const Template: ComponentStory<typeof AskForm> = (args) => <AskForm {...args} />

export const Default = Template.bind({})
Default.args = {
  inputPostData: {
    title: 'Post 1: How do I say hello?',
    description: 'No description',
  },
  inputAnswerData: {
    text: 'Hello there, you just need to type something',
  },
  topicOptions: [
    {
      id: 3,
      name: 'employers',
      description: 'Employers topic description',
      createdAt: new Date(),
      updatedAt: new Date(),
      agencyId: 4,
      parentId: null,
    },
    {
      id: 4,
      name: 'students',
      description: 'Students topic description',
      createdAt: new Date(),
      updatedAt: new Date(),
      agencyId: 4,
      parentId: null,
    },
  ],
  inputTopic: { value: 123, label: 'beginner' },
  submitButtonText: 'Confirm changes',
}
