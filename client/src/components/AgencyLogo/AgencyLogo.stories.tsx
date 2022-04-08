import { ComponentMeta, ComponentStory } from '@storybook/react'

import { MockAgencyData } from '../../__mocks__/mockData'

import AgencyLogo from './AgencyLogo.component'

export default {
  title: 'Components/AgencyLogo',
  component: AgencyLogo,
} as ComponentMeta<typeof AgencyLogo>

const Template: ComponentStory<typeof AgencyLogo> = (args) => (
  <AgencyLogo {...args} />
)

export const Default = Template.bind({})
Default.args = {
  agency: MockAgencyData,
}
