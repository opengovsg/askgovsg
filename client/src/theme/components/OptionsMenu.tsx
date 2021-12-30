import { ComponentMultiStyleConfig } from '@chakra-ui/theme'

export const OptionsMenu: ComponentMultiStyleConfig = {
  parts: ['optionAccordionItems'],
  baseStyle: ({ hasTopicsKey }) => ({
    accordionItem: {
      h: '72px',
      alignItems: 'center',
      textAlign: 'left',
      textStyle: 'h4',
      boxShadow: 'base',
      bg: 'secondary.700',
      color: 'white',
      _hover: { bg: 'secondary.600', boxShadow: 'lg' },
      w: hasTopicsKey ? '100%' : { base: '87%', sm: '100%' },
      mx: hasTopicsKey ? undefined : { base: 'auto', md: undefined },
      borderTopWidth: hasTopicsKey ? { base: '1px', sm: '0px' } : undefined,
      borderTopColor: hasTopicsKey ? 'secondary.500' : undefined,
    },
    accordionGrid: {
      'grid-template-columns': { base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
      maxW: '620px',
      m: 'auto',
      'grid-row-gap': hasTopicsKey
        ? { base: undefined, sm: '16px' }
        : { base: '16px' },
      'grid-column-gap': hasTopicsKey
        ? { base: undefined, sm: '16px' }
        : { base: '16px' },
      py: hasTopicsKey ? { base: undefined, sm: '48px' } : { base: '48px' },
    },
    accordionButton: {
      px: '0px',
      py: '0px',
      pt: hasTopicsKey ? '24px' : undefined,
      pb: hasTopicsKey ? '16px' : undefined,
      shadow: 'md',
      bg: hasTopicsKey ? 'secondary.700' : 'secondary.800',
    },
    accordionHeader: {
      textStyle: 'subhead-3',
      color: 'primary.400',
      pt: hasTopicsKey ? '8px' : undefined,
      mt: hasTopicsKey ? undefined : '36px',
    },
    accordionSubHeader: {
      textStyle: 'h3',
      color: 'white',
      pt: '8px',
    },
    accordionFlexBox: {
      maxW: '680px',
      m: 'auto',
      w: '100%',
      px: 8,
      textAlign: 'left',
    },
    sideMenuBox: {
      position: 'sticky',
      top: '0',
      ml: '32px !important',
      pt: '128px',
      mt: '-70px',
    },
    sideMenuTopicHeader: {
      color: 'primary.500',
      textStyle: 'subhead-3',
      mb: '20px',
      d: 'block',
      px: '24px',
    },
    sideMenuTopicText: {
      minH: '24px',
      d: 'block',
    },
    sideMenuTopicSelect: {
      alignItems: 'flex-start',
      minH: '56px',
      w: '280px',
      p: '16px 24px',
      rounded: 'md',
    },
  }),
}
