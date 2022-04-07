import React, { ReactElement, useState } from 'react'
import {
  Flex,
  Spacer,
  Text,
  useDisclosure,
  Editable,
  useMultiStyleConfig,
} from '@chakra-ui/react'
import { BiRightArrowAlt, BiEditAlt, BiTrash } from 'react-icons/bi'
import { Link as RouterLink } from 'react-router-dom'
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog.component'
import { useStyledToast } from '../StyledToast/StyledToast'
import { useMutation, useQueryClient } from 'react-query'
import { getApiErrorMessage } from '../../api'
import * as TopicService from '../../services/TopicService'
import { EditTopicCard, NonEditIconNameEnum } from './EditTopicCard.component'
import ActionMenu from './ActionMenu.component'

interface TopicCardProps {
  id: number
  name: string
  description: string | null
  parentId: number | null
  agencyId: number
  isAgencyMember: boolean | null
  url: string
  sendClickTopicEventToAnalytics: (topicName: string) => void
  setTopicQueried: (query: string) => void
}

export const TopicCard = ({
  id,
  name,
  description,
  parentId,
  agencyId,
  isAgencyMember,
  url,
  sendClickTopicEventToAnalytics,
  setTopicQueried,
}: TopicCardProps): ReactElement => {
  const styles = useMultiStyleConfig('OptionsMenu', {})

  const styledToast = useStyledToast()
  const queryClient = useQueryClient()

  const [isRenaming, setIsRenaming] = useState(false)
  const onRename = () => {
    setIsRenaming(true)
  }
  const onRenameSubmit = async (newTopicName: string) => {
    try {
      await TopicService.updateTopic({
        id,
        name: newTopicName,
        description,
        parentId,
        agencyId,
      })
      styledToast({
        status: 'success',
        description: 'Your topic has been renamed.',
      })
      queryClient.invalidateQueries('getTopicsUsedByAgency')
      setIsRenaming(false)
    } catch (err) {
      styledToast({
        status: 'error',
        description: getApiErrorMessage(err),
      })
    }
  }

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()
  const onDelete = () => {
    onDeleteOpen()
  }
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
  const onDeleteConfirm = () => deleteTopic.mutateAsync(id.toString())

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

  return isRenaming ? (
    <Editable
      defaultValue={name}
      submitOnBlur={false}
      startWithEditView={true}
      onSubmit={onRenameSubmit}
      onCancel={() => setIsRenaming(false)}
    >
      <EditTopicCard
        nonEditIconName={NonEditIconNameEnum.BiDotsVerticalRounded}
        style={styles.accordionItem}
      />
    </Editable>
  ) : (
    <>
      <Flex
        _hover={{ bg: 'secondary.600', boxShadow: 'lg' }}
        sx={styles.accordionItem}
        role="group"
        m="auto"
        w="100%"
        pl={8}
        pr={isAgencyMember ? 5 : 8} // because ActionMenu is wider than Icon
        as={RouterLink}
        to={url}
        onClick={() => {
          sendClickTopicEventToAnalytics(name)
          setTopicQueried(name)
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
