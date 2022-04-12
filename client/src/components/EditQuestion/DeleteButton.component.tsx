import { BiTrash } from 'react-icons/bi'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { Button, useDisclosure } from '@chakra-ui/react'

import { getApiErrorMessage } from '../../api'
import { DeviceType, useDetectDevice } from '../../hooks/useDetectDevice'
import {
  deletePost,
  GET_POST_BY_ID_QUERY_KEY,
  LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY,
} from '../../services/PostService'
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog.component'
import { useStyledToast } from '../StyledToast/StyledToast'

interface DeleteButtonProps {
  postId: number
  onDeleteLink: string
}

const DeleteButton = ({
  postId,
  onDeleteLink,
}: DeleteButtonProps): JSX.Element => {
  const deviceType = useDetectDevice()
  const {
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose,
    isOpen: isDeleteDialogOpen,
  } = useDisclosure()

  const navigate = useNavigate()
  const toast = useStyledToast()

  const queryClient = useQueryClient()
  const deletePostMutation = useMutation(deletePost, {
    onSuccess: () => {
      queryClient.invalidateQueries(
        LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY,
      )
      queryClient.invalidateQueries([GET_POST_BY_ID_QUERY_KEY, postId])
      toast({
        status: 'success',
        description: `Post has been deleted`,
      })
      if (onDeleteLink !== undefined) {
        navigate(onDeleteLink)
      }
    },
    onError: (err) => {
      toast({
        status: 'error',
        description: getApiErrorMessage(err),
      })
    },
  })

  const onDeleteConfirm = () => deletePostMutation.mutate(postId)

  return (
    <>
      <Button
        variant="clear"
        color="error.600"
        leftIcon={<BiTrash />}
        onClick={onDeleteDialogOpen}
        aria-label="Delete post"
      >
        {deviceType !== DeviceType.Mobile ? 'Delete' : ''}
      </Button>
      <ConfirmDialog
        title="Delete this post"
        description="You’re about to delete this post. Are you sure you want to delete it?"
        confirmText="Yes, delete post"
        isOpen={isDeleteDialogOpen}
        onConfirm={onDeleteConfirm}
        onClose={onDeleteDialogClose}
      />
    </>
  )
}

export default DeleteButton
