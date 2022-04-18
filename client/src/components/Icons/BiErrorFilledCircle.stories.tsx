import { ComponentMeta, ComponentStory } from '@storybook/react'

import BiErrorFilledCircle from './BiErrorFilledCircle.component'

export default {
  title: 'Components/Icons/BiErrorFilledCircle',
  component: BiErrorFilledCircle,
} as ComponentMeta<typeof BiErrorFilledCircle>

const Template: ComponentStory<typeof BiErrorFilledCircle> = () => (
  <BiErrorFilledCircle />
)

export const Default = Template.bind({})
