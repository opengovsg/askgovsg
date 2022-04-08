import React from 'react'
import {
  CSSObject,
  IconButton,
  Menu,
  MenuItem,
  MenuList,
} from '@chakra-ui/react'
import { BiDotsVerticalRounded } from 'react-icons/bi'
import NonBubblingMenuButton from './NonBubblingMenuButton.component'

interface MenuActions {
  label: string
  onClick: (e: React.MouseEvent) => void
  icon?: JSX.Element
  style?: CSSObject
}

interface ActionMenuProps {
  actions: Array<MenuActions>
}

const ActionMenu: React.FC<ActionMenuProps> = ({ actions }) => {
  return (
    <Menu>
      <NonBubblingMenuButton
        as={IconButton}
        icon={<BiDotsVerticalRounded />}
        variant="ghost"
      />
      <MenuList>
        {actions.map((action, i) => (
          <MenuItem
            key={i}
            icon={action.icon}
            sx={action.style}
            onClick={(e) => {
              // prevent bubbling
              e.preventDefault()
              e.stopPropagation()

              // delegate handler
              action.onClick(e)
            }}
          >
            {action.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}

export default ActionMenu
