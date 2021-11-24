import { ComponentMultiStyleConfig } from '@chakra-ui/theme'

export const AskForm: ComponentMultiStyleConfig = {
  parts: [
    'formLabel',
    'formHelperText',
    'buttonGroup',
    'charsRemainingBox',
    'submitButton',
    'cancelButton',
    'formControl',
  ],
  baseStyle: () => ({
    formLabel: {
      textStyle: 'subhead-1',
    },
    formHelperText: {
      textStyle: 'body-2',
      color: 'Secondary.800',
      pb: '12px',
    },
    buttonGroup: {
      spacing: '8px',
      mt: '40px',
    },
    charsRemainingBox: {
      textStyle: 'body-2',
      color: 'secondary.600',
      pt: '8px',
    },
    submitButton: {
      //textStyle is not used due to a bug in Chakra UI (Issue #3884)
      font: 'inter',
      fontSize: '16px',
      fontWeight: '500',
      color: 'white',
      bgColor: 'secondary.700',
    },
    cancelButton: {
      //textStyle is not used due to a bug in Chakra UI (Issue #3884)
      font: 'inter',
      fontSize: '16px',
      fontWeight: '500',
      bgColor: 'white',
    },
    formControl: {
      pt: '40px',
    },
  }),
}
