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
    compactSearch: {
      h: '56px',
      m: 'auto',
      maxW: '680px',
      w: '100%',
    },
    expandedSearchContainer: {
      bg: 'white',
      h: { base: '100px', xl: '152px' },
    },
    expandedSearch: {
      h: '56px',
      m: 'auto',
      mt: { base: '20px', xl: '64px' },
      px: { base: '24px', md: 'auto' },
      maxW: '680px',
      w: '100%',
    },
    logoBarMobile: {
      h: '64px',
      bg: 'white',
      px: 8,
      py: 4,
      shrink: 0,
      align: 'center',
    },
    logoBarTabletDesktop: {
      bg: 'white',
      px: 8,
      py: 4,
      shrink: 0,
      alignItems: 'center',
      display: 'grid',
      gridTemplateColumns: {
        base: '1fr 1fr',
        xl: '1fr 2fr 1fr',
      },
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
    websiteLink: {
      ml: 'auto',
      d: { base: 'none', xl: 'flex' },
    },
  }),
}
