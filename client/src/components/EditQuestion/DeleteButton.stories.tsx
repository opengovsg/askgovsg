import { ComponentMeta, ComponentStory } from '@storybook/react'

import DeleteButton from './DeleteButton.component'

export default {
  title: 'Components/Buttons/DeleteButton',
  component: DeleteButton,
} as ComponentMeta<typeof DeleteButton>

const Template: ComponentStory<typeof DeleteButton> = (args) => (
  <DeleteButton {...args} />
)

export const Default = Template.bind({})
Default.args = {
  postId: 1,
  onDeleteLink: '/delete',
}
