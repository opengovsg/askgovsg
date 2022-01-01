import { AuthProvider } from '../src/contexts/AuthContext'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter } from 'react-router'
import { theme } from '../src/theme'
import { ChakraProvider } from '@chakra-ui/react'
import * as React from 'react'
import { initialize, mswDecorator } from 'msw-storybook-addon'
import { rest } from 'msw'
import { HelmetProvider } from 'react-helmet-async'
import { MockUserData } from '../src/__mocks__/mockData'

// Initialize Mock Service Worker
initialize()

const queryClient = new QueryClient()

const withChakra = (StoryFn: Function) => {
  return (
    <ChakraProvider theme={theme}>
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <HelmetProvider>
              <StoryFn />
            </HelmetProvider>
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    </ChakraProvider>
  )
}

export const decorators = [withChakra, mswDecorator]

const customViewports = {
  desktop: {
    name: 'Desktop',
    styles: {
      width: '1440px',
      height: '963px',
    },
  },
  tablet: {
    name: 'Tablet',
    styles: {
      width: '780px',
      height: '801px',
    },
  },
  mobile: {
    name: 'Mobile',
    styles: {
      width: '470px',
      height: '601px',
    },
  },
}

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  chakra: { theme },
  viewport: {
    viewports: customViewports,
  },
  msw: {
    handlers: {
      auth: [
        rest.get('/api/v1/auth', (_req, res, ctx) => {
          return res(ctx.json(MockUserData))
        }),
      ],
      environment: [
        rest.get('/api/v1/environment', (_req, res, ctx) => {
          return res(
            ctx.json({
              bannerMessage: '',
              googleAnalyticsId: 'UA-123456789-3',
              fullStoryOrgId: 'ABC123',
            }),
          )
        }),
      ],
    },
  },
}
