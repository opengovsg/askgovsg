import { ComponentMeta, ComponentStory } from '@storybook/react'
import { rest } from 'msw'

import Login from './Login.component'

export default {
  title: 'Pages/Login',
  component: Login,
  parameters: {
    msw: {
      handlers: {
        auth: [
          rest.get('/api/v1/auth', (_req, res, ctx) => {
            return res(ctx.status(401))
          }),
        ],
      },
    },
  },
} as ComponentMeta<typeof Login>

const Template: ComponentStory<typeof Login> = () => <Login />

export const Default = Template.bind({})
