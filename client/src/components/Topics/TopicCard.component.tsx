import React, { FC, useRef, ReactElement, RefObject } from 'react'
import {
  Flex,
  Spacer,
  Text,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  CSSObject,
  useDisclosure,
  useOutsideClick,
  IconButton,
} from '@chakra-ui/react'
import {
  BiRightArrowAlt,
  BiEditAlt,
  BiDotsVerticalRounded,
  BiTrash,
} from 'react-icons/bi'
import { Link as RouterLink } from 'react-router-dom'

type ActionMenuProps = {
  actions: Array<{
    label: string
    onClick: (e: React.MouseEvent) => void
    icon?: JSX.Element
    style?: CSSObject
  }>
}

const ActionMenu: FC<ActionMenuProps> = ({ actions }) => {
  const ref = useRef(null)
  const { isOpen, onClose, onToggle } = useDisclosure()
  useOutsideClick({
    ref,
    handler: () => onClose(),
  })
  return (
    <div ref={ref}>
      <Menu isOpen={isOpen}>
        <MenuButton
          as={IconButton}
          icon={<BiDotsVerticalRounded />}
          onClick={(e) => {
            e.preventDefault()
            onToggle()
            console.log('onToggle clicked!')
          }}
          variant="ghost"
        >
          Click
        </MenuButton>
        <MenuList>
          {actions.map(({ onClick, label, icon, style }, i) => (
            <MenuItem
              key={i}
              icon={icon}
              sx={style}
              onClick={(e) => {
                e.preventDefault()
                onClose()
                onClick(e)
              }}
            >
              {label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </div>
  )
}

interface TopicCardProps {
  id: number
  name: string
  isAgencyMember: boolean | null
  url: string
  accordionRef: RefObject<HTMLButtonElement>
  accordionStyle?: CSSObject
  sendClickTopicEventToAnalytics: (topicName: string) => void
  setQueryTopicsState: (query: string) => void
}

export const TopicCard = ({
  id,
  name,
  isAgencyMember,
  url,
  accordionRef,
  accordionStyle,
  sendClickTopicEventToAnalytics,
  setQueryTopicsState,
}: TopicCardProps): ReactElement => {
  const onDelete = () => {
    console.log('delete')
  }

  const onRename = () => {
    console.log('rename')
  }

  const actions = [
    { label: 'Rename', icon: <BiEditAlt />, onClick: onRename },
    {
      label: 'Delete',
      icon: <BiTrash />,
      onClick: onDelete,
      style: { color: 'error.500' },
    },
  ]

  return (
    <Flex
      _hover={{ bg: 'secondary.600', boxShadow: 'lg' }}
      sx={accordionStyle}
      role="group"
      key={id}
      as={RouterLink}
      to={url}
      onClick={() => {
        sendClickTopicEventToAnalytics(name)
        setQueryTopicsState(name)
        accordionRef?.current?.click()
      }}
      m="auto"
      w="100%"
      px={8}
    >
      <Text>{name}</Text>
      <Spacer />
      {isAgencyMember ? (
        <>
          <Flex alignItems="center">
            <BiDotsVerticalRounded />
            {/*<ActionMenu actions={actions} />*/}
          </Flex>
        </>
      ) : (
        <>
          <Flex alignItems="center">
            <BiRightArrowAlt />
          </Flex>
        </>
      )}
    </Flex>
  )
}
