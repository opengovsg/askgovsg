//TODO: fix useNavigation -> do not navigate on click
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { rest } from 'msw'
import { MockAgencyData, MockTopicData } from '../../__mocks__/mockData'
import OptionsSideMenu from './OptionsSideMenu.component'

export default {
  title: 'Components/Nav/OptionsMenu/OptionsSideMenu',
  component: OptionsSideMenu,
  parameters: {
    msw: {
      handlers: {
        topics: [
          rest.get('/api/v1/agencies/:agencyid/topics', (_req, res, ctx) => {
            return res(ctx.json(MockTopicData))
          }),
        ],
      },
    },
  },
  args: {
    agency: MockAgencyData,
  },
} as ComponentMeta<typeof OptionsSideMenu>

//TODO: fix re-render on argtypes select
const Template: ComponentStory<typeof OptionsSideMenu> = (args) => (
  <OptionsSideMenu {...args} />
)

export const Default = Template.bind({})

export const Clicked = Template.bind({})
