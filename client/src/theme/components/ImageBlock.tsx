import { ComponentMultiStyleConfig } from '@chakra-ui/theme'

export const ImageBlock: ComponentMultiStyleConfig = {
  parts: [
    'popover',
    'buttonGroup',
    'button',
    'removeButton',
    'editButton',
    'titleText',
  ],
  baseStyle: () => ({
    popover: {
      h: '44px',
      px: '8px',
      mt: '4px',
      boxShadow: 'md',
      borderRadius: '4px',
      position: 'absolute',
      zIndex: '999',
      font: 'inter',
      fontSize: '8px',
      fontWeight: '500',
      bgColor: 'white',
    },
    buttonGroup: {
      spacing: '2',
    },
    button: {
      //textStyle is not used due to a bug in Chakra UI (Issue #3884)
      font: 'inter',
      fontSize: '12px',
      fontWeight: '500',
      bgColor: 'white',
      px: '8px',
      h: '28px',
      border: '1px',
      _disabled: {
        bgColor: 'secondary.700',
        color: 'white',
        border: '5px',
      },
    },
    removeButton: {
      //textStyle is not used due to a bug in Chakra UI (Issue #3884)
      font: 'inter',
      fontSize: '12px',
      fontWeight: '500',
      px: '8px',
      h: '28px',
      bgColor: 'white',
      _hover: {
        bgColor: 'white',
      },
    },
    editButton: {
      //textStyle is not used due to a bug in Chakra UI (Issue #3884)
      font: 'inter',
      fontSize: '12px',
      fontWeight: '500',
      h: '28px',
      px: '8px',
      bgColor: 'white',
      _hover: {
        bgColor: 'white',
      },
    },
  }),
}
