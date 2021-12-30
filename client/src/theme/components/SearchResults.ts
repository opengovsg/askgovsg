import { makeMultiStyleConfig } from './helpers'

export const SearchResults = makeMultiStyleConfig({
  spinner: {
    height: '200px',
  },
  breadcrumb: {
    mt: { base: '24px', sm: '60px' },
    mb: { base: '32px', sm: '64px' },
  },
  questionsPage: {
    px: { base: '32px', md: '48px' },
    mx: 'auto',
    w: { md: 'calc(793px + 48px * 2)' },
    flexDirection: 'column',
  },
  questionsGrid: {
    mb: { base: '32px', md: '58px' },
    flexDirection: 'column',
  },
  resultsHeadline: {
    textStyle: 'h4',
    mb: '8px',
  },
  searchQuery: { as: 'h2', fontSize: '24px', fontWeight: 'semibold' },
  questions: { padding: '0', w: { base: '100%', md: undefined } },
  noResults: {
    textStyle: 'subhead-1',
    color: 'secondary.800',
  },
  noResultsCaption: {
    mb: '8px',
  },
  questionsHeadline: {
    textStyle: 'subhead-3',
    color: 'primary.500',
    mb: { sm: '26px' },
  },
})
