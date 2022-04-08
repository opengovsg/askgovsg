import { ComponentMeta, ComponentStory } from '@storybook/react'

import { NavBreadcrumb } from './NavBreadcrumb'

export default {
  title: 'Components/Nav/NavBreadcrumb',
  component: NavBreadcrumb,
} as ComponentMeta<typeof NavBreadcrumb>

const Template: ComponentStory<typeof NavBreadcrumb> = (args) => (
  <NavBreadcrumb {...args} />
)

export const Default = Template.bind({})
Default.args = {
  navOrder: [
    { text: 'ABC', link: '/ABC' },
    { text: 'DEF', link: '/DEF' },
  ],
}
