import { ComponentMultiStyleConfig } from '@chakra-ui/theme'

export const ImageControl: ComponentMultiStyleConfig = {
  parts: [
    'box',
    'titleText',
    'tabText',
    'uploadedLargeBox',
    'uploadedImageFlexBox',
    'fileUploadBox',
    'dragOverText',
    'fileUploadText',
    'fileUploadFormatText',
    'altTextBox',
    'divider',
    'buttonsFlexBox',
    'cancelButton',
    'submitButton',
    'maxFileSizeText',
  ],
  baseStyle: () => ({
    box: {
      color: 'neutral.900',
      backgroundColor: 'white',
      borderRadius: '4px',
      borderColor: 'secondary.200',
      borderWidth: '1px',
      boxShadow: '0px 0px 10px var(--chakra-colors-secondary-100)',
      w: '100%',
      h: '100%',
    },
    titleText: {
      textAlign: 'left',
      textStyle: 'h2',
      borderBottom: '1px',
      borderBottomColor: 'neutral.300',
      py: '32px',
    },
    tabText: {
      _selected: {
        borderBottom: '2px',
        borderBottomColor: 'secondary.800',
      },
    },
    uploadedLargeBox: {
      w: '584px',
      h: '248px',
      bg: 'secondary.100',
      py: '16px',
      px: '14px',
    },
    uploadedImageFlexBox: {
      w: '160px',
      h: '160px',
      px: '8px',
      py: '8px',
      mb: '16px',
      bg: 'white',
      border: '1px',
      borderColor: 'neutral.400',
      borderRadius: '4px',
      alignItems: 'center',
      position: 'relative',
    },
    fileUploadBox: {
      w: '600px',
      h: '216px',
    },
    dragOverText: {
      textStyle: 'subhead-1',
      color: 'secondary.800',
    },
    fileUploadText: {
      fontFamily: 'Inter',
      fontSize: '16px',
      color: 'Secondary.800',
    },
    fileUploadFormatText: {
      textAlign: 'left',
      textStyle: 'subhead-1',
      pb: '12px',
      pt: '16px',
    },
    altTextBox: {
      px: '16px',
      pb: '16px',
      pt: '8px',
    },
    divider: {
      size: '1px',
      color: 'neutral.300',
      mt: '48px',
    },
    tabDivider: {
      size: '1px',
      color: 'neutral.300',
      mt: '-1px',
    },
    buttonsFlexBox: {
      justifyContent: 'flex-end',
      px: '16px',
      pb: '16px',
    },
    cancelButton: {
      textStyle: 'subhead-1',
      backgroundColor: 'white',
    },
    submitButton: {
      textStyle: 'subhead-1',
      backgroundColor: 'secondary.700',
      color: 'white',
    },
    maxFileSizeText: {
      textStyle: 'body-2',
    },
  }),
}
