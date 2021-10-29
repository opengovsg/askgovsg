import { ComponentMultiStyleConfig } from '@chakra-ui/theme'

export const StyledToast: ComponentMultiStyleConfig = {
  parts: [
    'boxContainer',
    'toastBox',
    'container',
    'icon',
    'message',
    'closeButton',
  ],
  baseStyle: () => ({
    toastBox: {
      maxw: '580px',
      minH: '56px',
      p: 4,
      borderWidth: '1px',
      borderRadius: '3px',
      pointerEvents: 'auto',
    },
    container: {
      alignItems: 'start',
    },
    icon: {
      boxSize: '24px',
    },
    message: {
      textStyle: 'body1',
    },
    closeButton: {
      minW: '24px',
      fontSize: '24px',
      ml: 2,
      color: 'neutral.700',
    },
  }),
  defaultProps: {
    colorScheme: 'success',
  },
}
