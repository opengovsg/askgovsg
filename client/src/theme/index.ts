import { extendTheme } from '@chakra-ui/react'

import { components } from './components'
import { colors } from './colors'
import { textStyles } from './textStyles'
import { breakpoints } from './breakpoints'
import { radii } from './radii'

export const theme = extendTheme({
  components,
  colors,
  radii,
  textStyles,
  breakpoints,
})
