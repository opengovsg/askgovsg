import { ComponentMeta, ComponentStory } from '@storybook/react'

import AgencyTerms from './AgencyTerms.component'

export default {
  title: 'Components/PrivacyTerms/AgencyTerms',
  component: AgencyTerms,
} as ComponentMeta<typeof AgencyTerms>

const Template: ComponentStory<typeof AgencyTerms> = () => <AgencyTerms />

export const Default = Template.bind({})
