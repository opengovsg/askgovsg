import { createBreakpoints } from '@chakra-ui/theme-tools'
// Note the following breakpoints for different devices:
// - mobile: 29.9375em and below
// - tablet: 30-89.9375em
// - desktop: 90em and above
export const breakpoints = createBreakpoints({
  xs: '22.5em',
  sm: '30em',
  md: '48em',
  lg: '64em',
  xl: '90em',
})
