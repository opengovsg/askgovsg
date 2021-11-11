import { ComponentMultiStyleConfig } from '@chakra-ui/theme'

export const SearchBox: ComponentMultiStyleConfig = {
  parts: [
    'form',
    'autocomplete',
    'box',
    'input',
    'results',
    'item',
    'itemText',
  ],
  baseStyle: () => ({
    form: {
      flexDirection: 'row',
      // make height responsive
      h: '100%',
      w: '100%',
      minH: '56px',
    },
    autocomplete: {
      w: '100%',
    },
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
    input: {
      fontSize: '16px',
      paddingInlineStart: '16px',
      _placeholder: {
        color: 'neutral.500',
      },
    },
    results: {
      overflowX: 'hidden',
      overflowY: 'auto',
      maxH: '20rem',
      w: '100%',

      zIndex: 50,
      marginInlineStart: 0,
      // copied box-shadow from chakra UI shadow 2xl,
      // with a much darker shade
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      borderRadius: 'button',
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 16px',
      boxSizing: 'border-box',
      width: '100%',
      backgroundColor: 'white',
      color: 'neutral.800',
    },
  }),
}
