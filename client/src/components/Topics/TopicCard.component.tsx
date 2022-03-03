import React, { FC, useRef, ReactElement } from 'react'
import {
  Flex,
  Spacer,
  Text,
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
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog.component'
import { useStyledToast } from '../StyledToast/StyledToast'
import { useMutation, useQueryClient } from 'react-query'
import { getApiErrorMessage } from '../../api'
import * as TopicService from '../../services/TopicService'

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
            e.stopPropagation() // needed to override onClick in parent component
            onToggle()
          }}
          variant="ghost"
        />
        <MenuList>
          {actions.map(({ onClick, label, icon, style }, i) => (
            <MenuItem
              key={i}
              icon={icon}
              sx={style}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation() // needed to override onClick in parent component
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
  accordionStyle?: CSSObject
  sendClickTopicEventToAnalytics: (topicName: string) => void
  setQueryTopicsState: (query: string) => void
}

export const TopicCard = ({
  id,
  name,
  isAgencyMember,
  url,
  accordionStyle,
  sendClickTopicEventToAnalytics,
  setQueryTopicsState,
}: TopicCardProps): ReactElement => {
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()
  const styledToast = useStyledToast()

  const queryClient = useQueryClient()
  const deleteTopic = useMutation(TopicService.deleteTopic, {
    onSuccess: () => {
      queryClient.invalidateQueries('getTopicsUsedByAgency')
      styledToast({
        status: 'success',
        description: 'Topic has been successfully deleted',
      })
    },
    onError: (err) => {
      styledToast({
        status: 'error',
        description: getApiErrorMessage(err),
      })
    },
  })
  const onDelete = () => {
    onDeleteOpen()
  }

  const onDeleteConfirm = () => deleteTopic.mutateAsync(id.toString())

  const onRename = () => {
    console.log('rename')
  }

  const actions = [
    {
      label: 'Rename',
      icon: <BiEditAlt />,
      onClick: onRename,
      style: { color: 'secondary.900' },
    },
    {
      label: 'Delete',
      icon: <BiTrash />,
      onClick: onDelete,
      style: { color: 'error.500' },
    },
  ]

  const confirmDialogText = `You are about to delete the topic "${name}". By deleting this topic, all questions under 
  this topic will also be deleted. You cannot undo this action. Are you sure?`

  return (
    <>
      <Flex
        _hover={{ bg: 'secondary.600', boxShadow: 'lg' }}
        sx={accordionStyle}
        role="group"
        key={id}
        m="auto"
        w="100%"
        pl={8}
        pr={isAgencyMember ? 5 : 8} // because ActionMenu is wider than Icon
        as={RouterLink}
        to={url}
        onClick={() => {
          sendClickTopicEventToAnalytics(name)
          setQueryTopicsState(name)
        }}
      >
        <Text>{name}</Text>

        <Spacer />
        {isAgencyMember ? (
          <ActionMenu actions={actions} />
        ) : (
          <BiRightArrowAlt />
        )}
      </Flex>
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={onDeleteConfirm}
        title="Confirm Delete?"
        description={confirmDialogText}
        confirmText="Yes, delete"
      />
    </>
  )
}
