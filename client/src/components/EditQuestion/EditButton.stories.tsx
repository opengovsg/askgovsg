import { ComponentMeta, ComponentStory } from '@storybook/react'

import EditButton from './EditButton.component'

export default {
  title: 'Components/Buttons/EditButton',
  component: EditButton,
} as ComponentMeta<typeof EditButton>

const Template: ComponentStory<typeof EditButton> = (args) => (
  <EditButton {...args} />
)

export const Default = Template.bind({})
Default.args = {
  postId: 1,
}
