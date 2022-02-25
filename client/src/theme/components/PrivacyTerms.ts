import { ComponentMultiStyleConfig } from '@chakra-ui/theme'

import { makeMultiStyleConfig } from './helpers'

const styles = {
  headerContainer: {
    bg: 'primary.500',
    h: '174px',
  },
  headerText: {
    textStyle: 'display-2',
    color: 'white',
    py: '50px',
    px: { base: '30px', sm: '100px' },
    maxW: '1100px',
    m: 'auto',
    w: '100vw',
  },
  terms: {
    maxW: '1100px',
    m: 'auto',
    w: '100vw',
    py: '66px',
    px: { base: '30px', sm: '100px' },

    '& .tou-point-bold, .tou-point-header::before': {
      textStyle: 'h2',
      color: 'primary.500',
    },

    '& ol': {
      listStyle: 'none',
      pt: '8px',
      pb: '8px',
    },

    '& li': {
      textStyle: 'body-1',
      color: 'secondary.800',
      display: 'flex',
      flexDir: 'column',
      pt: '8px',
      pb: '8px',
    },

    '& ol > li::before': {
      content: { base: '""', sm: 'attr(data-seq) " "' },
      position: 'relative',
      left: '-60px',
      h: '0',
      display: 'inline-block',
    },

    '& ol > li > ol > li > ol > li': {
      ml: '60px',
    },
  },
}

export const PrivacyTerms: ComponentMultiStyleConfig =
  makeMultiStyleConfig(styles)
