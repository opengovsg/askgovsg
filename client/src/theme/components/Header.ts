import { ComponentMultiStyleConfig } from '@chakra-ui/theme'

export const Header: ComponentMultiStyleConfig = {
  parts: [
    'root',
    'collapsedSearch',
    'expandedSearch',
    'expandedSearchContainer',
    'expandedSearchAgencyLogo',
    'logoBarContainer',
    'logoBarRouterLink',
    'logoBarAsk',
    'logoBarText',
    'logoBarWebsiteLink',
  ],
  baseStyle: () => ({
    root: {
      position: 'sticky',
      top: 0,
      zIndex: 999,
    },
    collapsedSearch: {
      h: '56px',
      m: 'auto',
      px: { base: '24px', md: 'auto' },
      maxW: '680px',
      w: '100%',
      mt: '-68px',
    },
    expandedSearchContainer: {
      bg: 'white',
      h: { base: '100px', xl: '152px' },
    },
    expandedSearchAgencyLogo: {
      ml: '36px',
      mt: '-55px',
      display: { base: 'none', xl: 'flex' },
    },
    expandedSearch: {
      h: '56px',
      m: 'auto',
      mt: { base: '20px', xl: '64px' },
      px: { base: '24px', md: 'auto' },
      maxW: '680px',
      w: '100%',
    },
    logoBarContainer: {
      bg: 'white',
      px: 8,
      py: 4,
      shrink: 0,
      align: 'center',
    },
    logoBarRouterLink: {
      _hover: {
        textDecoration: 'none',
      },
    },
    logoBarAsk: { marginRight: '-2px' },
    logoBarText: {
      // Force margins here to override stubborn and temperamental
      // Chakra defaults for content within HStack
      marginInlineStart: '0 !important',
      marginTop: 'auto !important',
      marginBottom: '1px !important',
      position: 'relative',
      textStyle: 'logo',
      color: 'black',
    },
    logoBarWebsiteLink: {
      d: { base: 'none', sm: 'block' },
    },
  }),
}
