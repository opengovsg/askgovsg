import { ComponentStory, ComponentMeta } from '@storybook/react'
import OGP from './OGP.component'

export default {
  title: 'Components/Icons/OGP',
  component: OGP,
} as ComponentMeta<typeof OGP>

const Template: ComponentStory<typeof OGP> = () => <OGP />

export const Default = Template.bind({})
