import { ComponentStory, ComponentMeta } from '@storybook/react'
import CitizenPrivacy from './CitizenPrivacy.component'

export default {
  title: 'Components/PrivacyTerms/CitizenPrivacy',
  component: CitizenPrivacy,
} as ComponentMeta<typeof CitizenPrivacy>

const Template: ComponentStory<typeof CitizenPrivacy> = () => <CitizenPrivacy />

export const Default = Template.bind({})
