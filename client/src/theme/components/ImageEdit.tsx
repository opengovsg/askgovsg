import { ComponentMultiStyleConfig } from '@chakra-ui/theme'

export const ImageEdit: ComponentMultiStyleConfig = {
  parts: ['popover', 'buttonGroup', 'button', 'removeButton'],
  baseStyle: () => ({
    popover: {
      h: '44px',
      px: '8px',
      mt: '4px',
      boxShadow: 'md',
      borderRadius: '4px',
      position: 'absolute',
      // display: 'inline-block',
      zIndex: '999',
      font: 'inter',
      fontSize: '8px',
      fontWeight: '500',
      bgColor: 'white',
    },
    buttonGroup: {
      spacing: '2',
      // overflow: 'hidden',
    },
    button: {
      //textStyle is not used due to a bug in Chakra UI (Issue #3884)
      font: 'inter',
      fontSize: '12px',
      fontWeight: '500',
      bgColor: 'white',
      w: '42px',
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
      w: '42px',
      h: '28px',
      px: '24px',
      bgColor: 'white',
      _hover: {
        bgColor: 'white',
      },
    },
  }),
}
