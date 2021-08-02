import {
  Button,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from '@chakra-ui/react'
import { ChevronDown, Trash } from '@styled-icons/boxicons-regular'
import React from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { Link as RouterLink, useHistory } from 'react-router-dom'
import { getApiErrorMessage } from '../../api'
import {
  deletePost,
  LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY,
} from '../../services/PostService'
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog.component'
import { useStyledToast } from '../StyledToast/StyledToast'

interface EditButtonProps {
  postId: string
  onDeleteLink?: string
}

const EditButton = ({ postId, onDeleteLink }: EditButtonProps): JSX.Element => {
  const {
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose,
    isOpen: isDeleteDialogOpen,
  } = useDisclosure()

  const history = useHistory()
  const toast = useStyledToast()

  const queryClient = useQueryClient()
  const deletePostMutation = useMutation(deletePost, {
    onSuccess: () => {
      queryClient.invalidateQueries(
        LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY,
      )
      toast({
        status: 'success',
        description: `Post has been deleted`,
      })
      if (onDeleteLink !== undefined) {
        history.push(onDeleteLink)
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

  // post prop is injected into button
  return (
    <>
      <RouterLink to={`/edit/question/${postId}`}>
        <Button
          variant="outline"
          borderRadius="3px"
          borderTopRightRadius="0"
          borderBottomRightRadius="0"
          borderColor="secondary.500"
        >
          Edit
        </Button>
      </RouterLink>
      <Menu placement="bottom-end">
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<Icon as={ChevronDown} color="secondary.500" />}
          variant="outline"
          borderRadius="3px"
          borderTopLeftRadius="0"
          borderBottomLeftRadius="0"
          borderLeft="none"
          borderColor="secondary.500"
        />
        <MenuList minW={105} color="error.500">
          <MenuItem
            onClick={onDeleteDialogOpen}
            icon={<Icon as={Trash} w={4} h={4} color="error.500" />}
          >
            Delete
          </MenuItem>
        </MenuList>
      </Menu>

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

export default EditButton
