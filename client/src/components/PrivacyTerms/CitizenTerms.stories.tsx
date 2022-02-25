import { ComponentMeta, ComponentStory } from '@storybook/react'

import CitizenTerms from './CitizenTerms.component'

export default {
  title: 'Components/PrivacyTerms/CitizenTerms',
  component: CitizenTerms,
} as ComponentMeta<typeof CitizenTerms>

const Template: ComponentStory<typeof CitizenTerms> = () => <CitizenTerms />

export const Default = Template.bind({})
