import { ComponentStory, ComponentMeta } from '@storybook/react'
import Spinner from './Spinner.component'

export default {
  title: 'Components/Spinner',
  component: Spinner,
} as ComponentMeta<typeof Spinner>

const Template: ComponentStory<typeof Spinner> = (args) => <Spinner {...args} />

export const Default = Template.bind({})
