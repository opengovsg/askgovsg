import { extendTheme } from '@chakra-ui/react'

import { breakpoints } from './breakpoints'
import { colors } from './colors'
import { components } from './components'
import { radii } from './radii'
import { textStyles } from './textStyles'

export const theme = extendTheme({
  components,
  colors,
  radii,
  textStyles,
  breakpoints,
})
