import { makeMultiStyleConfig } from './helpers'

export const PostItem = makeMultiStyleConfig({
  container: {
    justifyContent: 'space-between',
    py: '24px',
    borderBottom: '1px solid',
    borderBottomColor: 'neutral.300',
  },
  content: {
    maxW: '1188px',
    px: { base: '24px', sm: '88px' },
  },
  linkText: {
    textStyle: 'h4',
    color: 'secondary.800',
    _hover: {
      color: 'secondary.600',
    },
  },
  description: {
    textStyle: 'body-2',
    color: 'secondary.800',
    '& .public-DraftStyleDefault-block': {
      my: 0,
    },
  },
  editWrapper: {
    alignItems: 'center',
  },
})
