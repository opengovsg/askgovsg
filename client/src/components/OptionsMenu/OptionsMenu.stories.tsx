import { ComponentStory, ComponentMeta } from '@storybook/react'
import { rest } from 'msw'
import {
  MockAgencyShortNameData,
  MockTopicData,
} from '../../__mocks__/mockData'
import OptionsMenu from './OptionsMenu.component'

export default {
  title: 'Components/Nav/OptionsMenu/OptionsMenu',
  component: OptionsMenu,
  parameters: {
    msw: {
      handlers: {
        agency: [
          rest.get('/api/v1/agencies/shortnames', (_req, res, ctx) => {
            return res(ctx.json(MockAgencyShortNameData))
          }),
        ],
        topics: [
          rest.get('/api/v1/topics', (_req, res, ctx) => {
            return res(ctx.json(MockTopicData))
          }),
        ],
      },
    },
  },
} as ComponentMeta<typeof OptionsMenu>

const Template: ComponentStory<typeof OptionsMenu> = () => <OptionsMenu />

export const Default = Template.bind({})
