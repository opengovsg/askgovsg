import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Banner } from './Banner.component'

export default {
  title: 'Components/Headers/Banner',
  component: Banner,
} as ComponentMeta<typeof Banner>

const Template: ComponentStory<typeof Banner> = (args) => <Banner {...args} />

export const Default = Template.bind({})
Default.args = {
  data: {
    bannerMessage:
      'This is a test site. Content here is dummy data and meant for testing purposes.',
    googleAnalyticsId: 'abcd',
    fullStoryOrgId: 'abcd',
  },
  isSuccess: true,
}
