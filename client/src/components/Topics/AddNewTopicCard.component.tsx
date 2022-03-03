import { ReactElement, useRef } from 'react'
import {
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  IconButton,
  Spacer,
  useEditableState,
  useMultiStyleConfig,
  useOutsideClick,
} from '@chakra-ui/react'
import { BiCheck, BiPlus } from 'react-icons/bi'
import { getApiErrorMessage } from '../../api'
import { useStyledToast } from '../StyledToast/StyledToast'
import * as TopicService from '../../services/TopicService'
import { useNavigate } from 'react-router-dom'

const CreateTopicButton = (): ReactElement => {
  const { onSubmit } = useEditableState()
  return (
    <IconButton
      aria-label={'Create topic'}
      icon={<BiCheck />}
      variant="ghost"
      onClick={onSubmit}
    />
  )
}

const AddNewTopicCardEditableComponent = (): ReactElement => {
  const { isEditing, onCancel, onEdit } = useEditableState()
  const styles = useMultiStyleConfig('OptionsMenu', {})
  const ref = useRef(null)
  useOutsideClick({
    ref,
    handler: () => onCancel(),
  })
  return (
    <div ref={ref}>
      <Flex
        sx={styles.newAccordionItem}
        _hover={{ bg: 'secondary.600', boxShadow: 'lg' }}
        role="group"
        m="auto"
        w="100%"
        pl={8}
        pr={isEditing ? 5 : 8}
        onClick={onEdit}
      >
        <Flex>
          <EditablePreview />
          <EditableInput sx={styles.accordionInput} />
        </Flex>

        <Spacer />
        <Flex alignItems="center">
          {isEditing ? <CreateTopicButton /> : <BiPlus />}
        </Flex>
      </Flex>
    </div>
  )
}

interface AddNewTopicProps {
  agencyId: number
  agencyShortName: string
}

export const AddNewTopicCard = ({
  agencyId,
  agencyShortName,
}: AddNewTopicProps): ReactElement => {
  const navigate = useNavigate()
  const toast = useStyledToast()
  const onSubmit = async (topicName: string) => {
    try {
      const data = await TopicService.createTopic({
        name: topicName,
        // TODO: pending designer input, need to find a way to update topic description
        description: '',
        parentId: null,
        agencyId,
      })
      toast({
        status: 'success',
        description: 'Your post has been created.',
      })
      navigate(`/agency/${agencyShortName}?topics=${data.name}`)
    } catch (err) {
      toast({
        status: 'error',
        description: getApiErrorMessage(err),
      })
    }
  }
  return (
    <Editable
      placeholder="Add new topic"
      submitOnBlur={false}
      onSubmit={onSubmit}
    >
      <AddNewTopicCardEditableComponent />
    </Editable>
  )
}
