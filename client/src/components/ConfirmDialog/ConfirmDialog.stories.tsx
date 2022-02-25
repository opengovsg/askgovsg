import { ComponentMeta, ComponentStory } from '@storybook/react'

import { ConfirmDialog } from './ConfirmDialog.component'

export default {
  title: 'Components/Modals/ConfirmDialog',
  component: ConfirmDialog,
} as ComponentMeta<typeof ConfirmDialog>

const Template: ComponentStory<typeof ConfirmDialog> = (args) => (
  <ConfirmDialog {...args} />
)

export const Default = Template.bind({})
Default.args = {
  title: 'Delete this post',
  description:
    'You’re about to delete this post. Are you sure you want to delete it?',
  confirmText: 'Yes, delete post',
  isOpen: true,
  onClose: undefined,
}
