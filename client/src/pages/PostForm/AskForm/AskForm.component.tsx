import {
  Alert,
  AlertIcon,
  FormLabel,
  FormControl,
  FormHelperText,
  Input,
  Button,
  ButtonGroup,
  Box,
  HStack,
  useMultiStyleConfig,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { Topic } from '~shared/types/base'
import { RichTextEditor } from '../../../components/RichText/RichTextEditor.component'

export type AskFormSubmission = {
  postData: { title: string; description: string }
  answerData: { text: string }
  topic: number
}

type TopicOption = { value: number; label: string }

interface AskFormProps {
  inputPostData?: {
    title: string
    description: string
  }
  inputAnswerData?: {
    text: string
  }
  inputTopic?: TopicOption
  topicOptions: Topic[]
  onSubmit: (formData: AskFormSubmission) => Promise<void>
  submitButtonText: string
}

interface AskFormInput {
  postTitle: string
  postDescription: string
  answerBody: string
  topic: TopicOption
}

const TITLE_MAX_LEN = 150

const AskForm = ({
  inputPostData = {
    title: '',
    description: '',
  },
  inputAnswerData = {
    text: '',
  },
  inputTopic = {
    value: 0,
    label: '',
  },
  topicOptions,
  onSubmit,
  submitButtonText,
}: AskFormProps): JSX.Element => {
  const styles = useMultiStyleConfig('AskForm', {})

  const navigate = useNavigate()
  const { register, control, handleSubmit, watch, formState } =
    useForm<AskFormInput>({
      defaultValues: {
        postTitle: inputPostData.title,
        postDescription: inputPostData.description,
        answerBody: inputAnswerData.text,
        topic: inputTopic,
      },
    })
  const { errors: formErrors } = formState

  const optionsForTopicSelect: TopicOption[] = useMemo(
    () =>
      topicOptions.map((topic) => ({
        value: topic.id,
        label: topic.name,
      })),
    [topicOptions],
  )

  const isTopicChosen = (selectedTopics: TopicOption) => {
    return Boolean(selectedTopics?.value)
  }

  const replaceEmptyRichTextInput = (value: string): string =>
    value === '<p></p>\n' ? '' : value

  const watchTitle = watch('postTitle')

  const titleCharsRemaining =
    watchTitle && typeof watchTitle === 'string'
      ? Math.max(TITLE_MAX_LEN - watchTitle.length, 0)
      : TITLE_MAX_LEN

  const internalOnSubmit = handleSubmit((formData) =>
    onSubmit({
      postData: {
        title: formData.postTitle,
        description: replaceEmptyRichTextInput(formData.postDescription),
      },
      answerData: {
        text: replaceEmptyRichTextInput(formData.answerBody),
      },
      topic: formData.topic.value,
    }),
  )

  return (
    <form onSubmit={internalOnSubmit}>
      <FormControl>
        <FormLabel sx={styles.formLabel}>Question</FormLabel>
        <FormHelperText sx={styles.formHelperText}>
          Give your question a short and relevant title
        </FormHelperText>
        <Input
          placeholder="Field Empty"
          {...register('postTitle', {
            minLength: 15,
            maxLength: TITLE_MAX_LEN,
            required: true,
          })}
        />
        {formErrors.postTitle ? (
          <Alert status="error" mt="4px">
            <AlertIcon />
            Please enter a title with 15-150 characters.
          </Alert>
        ) : (
          <Box sx={styles.charsRemainingBox}>
            {titleCharsRemaining} characters left
          </Box>
        )}
      </FormControl>
      <FormControl sx={styles.formControl}>
        <HStack>
          <Box sx={styles.formLabel}>Description</Box>
          <Box textStyle="body-2">(optional)</Box>
        </HStack>

        <FormHelperText sx={styles.formHelperText}>
          Additional description to give more context to your question
        </FormHelperText>
        <Controller
          name="postDescription"
          control={control}
          rules={{
            validate: (v) => !replaceEmptyRichTextInput(v) || v.length >= 30,
          }}
          render={({ field: { onChange, value, ref } }) => (
            <RichTextEditor
              onChange={onChange}
              value={value}
              editorRef={ref}
              wrapperStyle={{ height: '148px' }}
              editorStyle={{ height: `${148 - (26 + 6 * 2)}px` }}
            />
          )}
        />
        {formState.errors.postDescription && (
          <Alert status="error" mt="4px">
            <AlertIcon />
            Please enter at least 30 characters.
          </Alert>
        )}
      </FormControl>
      <FormControl sx={styles.formControl}>
        <FormLabel sx={styles.formLabel}>Topic</FormLabel>
        <FormHelperText sx={styles.formHelperText}>
          Choose a topic for the question
        </FormHelperText>
        <Controller
          name="topic"
          control={control}
          rules={{ validate: isTopicChosen }}
          render={({ field: { onChange, value } }) => (
            <Select
              options={optionsForTopicSelect}
              value={optionsForTopicSelect.find(
                (topic) => topic.value === value.value,
              )}
              onChange={(topic) => onChange(topic)}
              menuPortalTarget={document.body}
            />
          )}
        />
        {formState.errors.topic && (
          <Alert status="error" mt="4px">
            <AlertIcon />
            Please select a topic.
          </Alert>
        )}
      </FormControl>
      <FormControl sx={styles.formControl}>
        <FormLabel sx={styles.formLabel}>Answer</FormLabel>
        <FormHelperText sx={styles.formHelperText}>
          Type in the answer to the question
        </FormHelperText>
        <Controller
          name="answerBody"
          control={control}
          rules={{ minLength: 30 }}
          render={({ field: { onChange, value, ref } }) => (
            <RichTextEditor
              onChange={onChange}
              value={value}
              editorRef={ref}
              placeholder="Enter answer with minimum 30 characters"
            />
          )}
        />
        {formErrors.answerBody && (
          <Alert status="error" mt="4px">
            <AlertIcon />
            Please enter at least 30 characters.
          </Alert>
        )}
      </FormControl>
      <ButtonGroup sx={styles.buttonGroup}>
        <Button type="submit" sx={styles.submitButton}>
          {submitButtonText}
        </Button>
        <Button sx={styles.cancelButton} onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </ButtonGroup>
    </form>
  )
}

export default AskForm
