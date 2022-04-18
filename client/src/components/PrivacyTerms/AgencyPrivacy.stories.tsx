import { ComponentMeta, ComponentStory } from '@storybook/react'

import AgencyPrivacy from './AgencyPrivacy.component'

export default {
  title: 'Components/PrivacyTerms/AgencyPrivacy',
  component: AgencyPrivacy,
} as ComponentMeta<typeof AgencyPrivacy>

const Template: ComponentStory<typeof AgencyPrivacy> = () => <AgencyPrivacy />

export const Default = Template.bind({})
