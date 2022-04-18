import { ComponentMultiStyleConfig } from '@chakra-ui/theme'

import { makeMultiStyleConfig } from './helpers'

const styles = {
  container: {
    boxSizing: 'border-box',
    ml: 'auto',
    mr: 'auto',
    width: '100%',
    maxW: 'calc(793px + 48px * 2)',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    flex: '1 0 auto',
    color: 'neutral.900',
    padding: '0 48px',
  },
  content: {
    minH: '750px',
    overflow: 'visible',
    width: '100%',
    margin: '0',
    backgroundColor: 'transparent',
    pt: '0',
  },
  header: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    mb: '36px',
    textStyle: 'h2',
    color: 'primary.500',
  },
  section: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    color: 'neutral.900',
  },
  form: {
    width: '100%',
  },
}

export const AdminForm: ComponentMultiStyleConfig = makeMultiStyleConfig(styles)
