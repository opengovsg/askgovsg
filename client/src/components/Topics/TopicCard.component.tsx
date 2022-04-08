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
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { getApiErrorMessage } from '../../api'
import * as TopicService from '../../services/TopicService'
import { EditTopicCard, NonEditIconNameEnum } from './EditTopicCard.component'
import ActionMenu from './ActionMenu.component'
import { FailureDialog } from '../FailureDialog/FailureDialog.component'
import { LIST_POSTS_QUERY_KEY, listPosts } from '../../services/PostService'

interface TopicCardProps {
  id: number
  topicName: string
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
  topicName,
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
  const queryKey = [
    LIST_POSTS_QUERY_KEY,
    {
      agencyId: agencyId,
      topics: topicName,
    },
  ]
  const queryFn = () =>
    listPosts(undefined, agencyId, undefined, topicName, undefined, undefined)

  const { data } = useQuery(queryKey, queryFn)
  const numberOfQuestions = data?.totalItems

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

  return isRenaming ? (
    <Editable
      defaultValue={topicName}
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
          sendClickTopicEventToAnalytics(topicName)
          setTopicQueried(topicName)
        }}
      >
        <Text>{topicName}</Text>

        <Spacer />
        {isAgencyMember ? (
          <ActionMenu actions={actions} />
        ) : (
          <BiRightArrowAlt />
        )}
      </Flex>
      {numberOfQuestions === 0 ? (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          onConfirm={onDeleteConfirm}
          title="Confirm Delete?"
          description={`Are you sure you want to delete the topic '${topicName}'? You cannot undo this action.`}
          confirmText="Yes, delete"
        />
      ) : (
        <FailureDialog
          title={`Unable to delete the topic '${topicName}'`}
          plainMessage="Please delete or move existing questions to another topic before deleting this topic."
          failureMessage={`There are ${numberOfQuestions} questions under '${topicName}'.`}
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
        />
      )}
    </>
  )
}
