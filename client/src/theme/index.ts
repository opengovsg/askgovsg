import { extendTheme } from '@chakra-ui/react'

import { components } from './components'
import { colors } from './colors'
import { textStyles } from './textStyles'

export const theme = extendTheme({
  components,
  colors,
  textStyles,
})
