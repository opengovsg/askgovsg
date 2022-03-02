import { ComponentStory, ComponentMeta } from '@storybook/react'
import { rest } from 'msw'
import Header from './Header.component'

export default {
  title: 'Components/Headers/Header',
  component: Header,
} as ComponentMeta<typeof Header>

const Template: ComponentStory<typeof Header> = () => <Header />

export const LoggedIn = Template.bind({})
export const LoggedOut = Template.bind({})
LoggedOut.parameters = {
  msw: {
    handlers: {
      auth: [
        rest.get('/api/v1/auth', (_req, res, ctx) => {
          return res(ctx.status(401))
        }),
      ],
    },
  },
}
