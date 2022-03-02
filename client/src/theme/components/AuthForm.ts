import { ComponentMultiStyleConfig } from '@chakra-ui/theme'
import { makeMultiStyleConfig } from './helpers'

const styles = {
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    mt: '32px',
    flexDirection: 'column',
    width: '320px',
    '& form': {
      width: '100%',
    },
  },
  label: {
    mt: '16px',
    textStyle: 'subhead-1',
  },
  input: {
    textStyle: 'body-1',
    py: '4px',
    px: '8px',
    border: '2px solid',
    borderColor: 'neutral.400',
    _placeholder: {
      color: 'neutral.500',
    },
  },
  submitButton: {
    textStyle: 'body-1',
    bg: 'secondary.700',
    border: 0,
    borderRadius: 'button',
    color: 'white',
    mt: '16px',
    padding: '8px',
    cursor: 'pointer',
  },
}

export const AuthForm: ComponentMultiStyleConfig = makeMultiStyleConfig(styles)
