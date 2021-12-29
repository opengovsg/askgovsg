import { makeMultiStyleConfig } from './helpers'

export const SearchResults = makeMultiStyleConfig({
  spinner: {
    height: '200px',
  },
  breadcrumb: {
    mt: { base: '32px', sm: '60px' },
    mb: { base: '32px', sm: '50px' },
  },
  questionsPage: {
    px: { base: '32px', md: '48px' },
    mx: 'auto',
    maxW: 'calc(793px + 48px * 2)',
  },
  questionsGrid: {
    textStyle: 'display-2',
    as: 'h3',
    mb: '24px',
    flex: '1 auto',
  },
  questionsHeadline: {
    as: 'h3',
    textStyle: 'display-2',
    mb: '24px',
    flex: '1 auto',
  },
  questions: { padding: '0', w: { base: '100%', md: undefined } },
  noResults: {
    textStyle: 'subhead-1',
    color: 'gray.800',
  },
})
