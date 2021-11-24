import { ComponentMultiStyleConfig, CSSObject } from '@chakra-ui/react'

export const makeMultiStyleConfig = (
  styles: Record<string, CSSObject | undefined>,
): ComponentMultiStyleConfig => ({
  parts: Object.keys(styles),
  baseStyle: () => styles,
})
