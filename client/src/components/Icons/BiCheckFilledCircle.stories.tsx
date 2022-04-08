import { ComponentMeta, ComponentStory } from '@storybook/react'

import BiCheckFilledCircle from './BiCheckFilledCircle.component'

export default {
  title: 'Components/Icons/BiCheckFilledCircle',
  component: BiCheckFilledCircle,
} as ComponentMeta<typeof BiCheckFilledCircle>

const Template: ComponentStory<typeof BiCheckFilledCircle> = () => (
  <BiCheckFilledCircle />
)

export const Default = Template.bind({})
