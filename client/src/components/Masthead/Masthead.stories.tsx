import { ComponentStory, ComponentMeta } from '@storybook/react'
import Masthead from './Masthead.component'

export default {
  title: 'Components/Headers/Masthead',
  component: Masthead,
} as ComponentMeta<typeof Masthead>

const Template: ComponentStory<typeof Masthead> = () => <Masthead />

export const Default = Template.bind({})
