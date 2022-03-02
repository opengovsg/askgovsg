import { ComponentStory, ComponentMeta } from '@storybook/react'
import { BackToHome } from './BackToHome'

export default {
  title: 'Components/Nav/BackToHome',
  component: BackToHome,
} as ComponentMeta<typeof BackToHome>

const Template: ComponentStory<typeof BackToHome> = (args) => (
  <BackToHome {...args} />
)

export const Default = Template.bind({})
