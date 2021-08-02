import { theme } from '@chakra-ui/react'

const adjustedBaseStyle = {
  ...theme.components.Button.baseStyle,
  border: 'none',
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: '16px',
  lineHeight: '24px',
  letterSpacing: '-0.011em',
  textAlign: 'center',
}

export const Button = {
  baseStyle: adjustedBaseStyle,
  variants: {
    editButton: {
      height: '40px',
      width: '78px',
      padding: '0px',
      bgColor: 'transparent',
      borderRadius: '3px 0 0 3px',
      border: '1px solid #445072',
      margin: '0px',
      color: '#445072',
    },
  },
}
