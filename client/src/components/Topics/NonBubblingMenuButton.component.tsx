import {
  ComponentWithAs,
  MenuButton,
  MenuButtonProps,
  useMenuContext,
} from '@chakra-ui/react'

const NonBubblingMenuButton: ComponentWithAs<'button', MenuButtonProps> = (
  props,
) => {
  const menu = useMenuContext()

  return (
    <MenuButton
      {...props}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        menu.onToggle()
      }}
    />
  )
}

export default NonBubblingMenuButton
