import { BiPencil } from 'react-icons/bi'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from '@chakra-ui/react'

import { DeviceType, useDetectDevice } from '../../hooks/useDetectDevice'

interface EditButtonProps {
  postId: number
}

const EditButton = ({ postId }: EditButtonProps): JSX.Element => {
  const deviceType = useDetectDevice()
  // post prop is injected into button
  return (
    <RouterLink to={`/edit/question/${postId}`}>
      <Button
        variant="clear"
        textColor="secondary.700"
        leftIcon={<BiPencil />}
        aria-label="Edit post"
      >
        {deviceType !== DeviceType.Mobile ? 'Edit' : ''}
      </Button>
    </RouterLink>
  )
}

export default EditButton
