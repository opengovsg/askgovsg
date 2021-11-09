import { Alert, AlertIcon } from '@chakra-ui/react'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { Topic } from '~shared/types/base'
import { RichTextEditor } from '../../../components/RichText/RichTextEditor.component'
import './AskForm.styles.scss'

export type AskFormSubmission = {
  postData: { title: string; description: string }
  answerData: { text: string }
  topic: number
}

interface AskFormProps {
  inputPostData?: {
    title: string
    description: string
  }
  inputAnswerData?: {
    text: string
  }
  inputTopic?: Topic
  topicOptions: Topic[]
  onSubmit: (formData: AskFormSubmission) => Promise<void>
  submitButtonText: string
}

type TopicOption = { value: number; label: string }

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
  inputTopic,
  topicOptions,
  onSubmit,
  submitButtonText,
}: AskFormProps): JSX.Element => {
  const existingTopicSelection = useMemo(
    () => ({
      value: inputTopic?.id,
      label: inputTopic?.name,
    }),
    [inputTopic],
  )
  const navigate = useNavigate()
  const { register, control, handleSubmit, watch, formState } =
    useForm<AskFormInput>({
      defaultValues: {
        postTitle: inputPostData.title,
        postDescription: inputPostData.description,
        answerBody: inputAnswerData.text,
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
      <div className="question-form">
        <div className="question-layout">
          <div className="grid title-grid">
            <label className="form-label">
              Question
              <p>Give your question a short and relevant title</p>
            </label>
            <input
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
              <p className="char-remain">
                {titleCharsRemaining} characters left
              </p>
            )}
          </div>
          <div className="grid richtext-grid description-section">
            <label className="form-label">
              Description <div>(optional)</div>
            </label>
            <Controller
              name="postDescription"
              control={control}
              rules={{
                validate: (v) =>
                  !replaceEmptyRichTextInput(v) || v.length >= 30,
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
          </div>
          <div className="grid tag-grid">
            <label className="form-label">
              Topic
              <p>Choose a topic for the question</p>
            </label>
            <div className="topic-dropdown">
              <Controller
                name="topic"
                control={control}
                rules={{ validate: isTopicChosen }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={optionsForTopicSelect}
                    key={existingTopicSelection.value}
                    //supplied defaultValue here instead of in defaultValues
                    //as the key prop is required to force rendering
                    defaultValue={existingTopicSelection}
                    menuPortalTarget={document.body}
                  />
                )}
              />
            </div>
            {formState.errors.topic && (
              <Alert status="error" mt="4px">
                <AlertIcon />
                Please select a topic.
              </Alert>
            )}
          </div>
          {/* Answer switch */}

          <div className="grid richtext-grid answer-section">
            <label className="form-label" id="answer-row">
              Answer your own question
            </label>
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
          </div>
        </div>
      </div>
      <div className="post-button">
        <input
          id="submit-button"
          name="submit-button"
          value={submitButtonText}
          type="submit"
        />
        <div className="cancel-text" onClick={() => navigate(-1)}>
          Cancel
        </div>
      </div>
    </form>
  )
}

export default AskForm
