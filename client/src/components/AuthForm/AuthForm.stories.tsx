import { ComponentMeta, ComponentStory } from '@storybook/react'

import AuthForm from './AuthForm.component'

export default {
  title: 'Components/AuthForm',
  component: AuthForm,
} as ComponentMeta<typeof AuthForm>

const Template: ComponentStory<typeof AuthForm> = () => <AuthForm />

export const Default = Template.bind({})
