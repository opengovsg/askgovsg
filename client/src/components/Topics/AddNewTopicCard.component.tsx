import { ReactElement, useState } from 'react'
import { Editable, useMultiStyleConfig } from '@chakra-ui/react'
import { getApiErrorMessage } from '../../api'
import { useStyledToast } from '../StyledToast/StyledToast'
import * as TopicService from '../../services/TopicService'
import { EditTopicCard, NonEditIconNameEnum } from './EditTopicCard.component'
import { useQueryClient } from 'react-query'

interface AddNewTopicProps {
  agencyId: number
}

export const AddNewTopicCard = ({
  agencyId,
}: AddNewTopicProps): ReactElement => {
  const styles = useMultiStyleConfig('OptionsMenu', {})
  const queryClient = useQueryClient()
  const toast = useStyledToast()
  const [editableString, setEditableString] = useState('')
  const onSubmit = async (topicName: string) => {
    try {
      await TopicService.createTopic({
        name: topicName,
        // TODO: pending designer input, need to find a way to update topic description
        description: '',
        parentId: null,
        agencyId,
      })
      toast({
        status: 'success',
        description: 'Your topic has been created.',
      })
      setEditableString('')
      queryClient.invalidateQueries('getTopicsUsedByAgency')
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
      onChange={(input) => setEditableString(input)}
      value={editableString}
      onCancel={() => setEditableString('')}
    >
      <EditTopicCard
        nonEditIconName={NonEditIconNameEnum.BiPlus}
        style={styles.newAccordionItem}
      />
    </Editable>
  )
}
