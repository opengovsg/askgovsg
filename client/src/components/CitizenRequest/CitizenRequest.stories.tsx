import { ComponentStory, ComponentMeta } from '@storybook/react'
import { MockAgencyData } from '../../__mocks__/mockData'
import CitizenRequest from './CitizenRequest.component'

export default {
  title: 'Components/CitizenRequest',
  component: CitizenRequest,
} as ComponentMeta<typeof CitizenRequest>

const Template: ComponentStory<typeof CitizenRequest> = (args) => (
  <CitizenRequest {...args} />
)

export const Default = Template.bind({})
Default.args = {
  agency: MockAgencyData,
}
