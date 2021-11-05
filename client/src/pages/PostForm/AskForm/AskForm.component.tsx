import { Alert, AlertIcon, Switch } from '@chakra-ui/react'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { Tag, TagType } from '~shared/types/base'
import { RichTextEditor } from '../../../components/RichText/RichTextEditor.component'
import './AskForm.styles.scss'

export type AskFormSubmission = {
  postData: { title: string; description: string }
  answerData: { text: string }
  tags: string[]
  topic?: string
}

interface AskFormProps {
  inputPostData?: {
    title: string
    description: string
  }
  inputAnswerData?: {
    text: string
  }
  inputTags?: string[]
  tagOptions: Tag[]
  onSubmit: (formData: AskFormSubmission) => Promise<void>
  submitButtonText: string
}

type TagOption = { value: string; label: string }

interface AskFormInput {
  postTitle: string
  postDescription: string
  answerBody: string
  tags: TagOption[]
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
  inputTags = [],
  tagOptions,
  onSubmit,
  submitButtonText,
}: AskFormProps): JSX.Element => {
  const existingTagSelection: TagOption[] = useMemo(
    () =>
      inputTags.map((t) => ({
        value: t,
        label: t,
      })),
    [inputTags],
  )
  const navigate = useNavigate()
  const { register, control, handleSubmit, watch, formState } =
    useForm<AskFormInput>({
      defaultValues: {
        postTitle: inputPostData.title,
        postDescription: inputPostData.description,
        answerBody: inputAnswerData.text,
        tags: existingTagSelection,
      },
    })
  const { errors: formErrors } = formState

  const optionsForTagSelect: TagOption[] = useMemo(
    () =>
      tagOptions.map((t) => ({
        value: t.tagname,
        label: t.tagname,
      })),
    [tagOptions],
  )
  const areTagsValid = (selectedTags: TagOption[]) =>
    // At least one selected tag must be an agency tag
    selectedTags.some((selected) => {
      const dataOfTag = tagOptions.find(
        (option) => option.tagname === selected.value,
      )
      return dataOfTag?.tagType === TagType.Agency
    })

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
      tags: formData.tags.map((t) => t.value),
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
              Tag
              <p>
                Choose at least one keyword tag you want the question to be
                associated with
              </p>
            </label>
            <div className="tag-dropdown">
              <Controller
                name="tags"
                control={control}
                rules={{ validate: areTagsValid }}
                render={({ field }) => (
                  <Select
                    {...field}
                    isMulti
                    options={optionsForTagSelect}
                    // Portal the select menu to document.body
                    menuPortalTarget={document.body}
                  />
                )}
              />
            </div>
            {formState.errors.tags && (
              <Alert status="error" mt="4px">
                <AlertIcon />
                Please select at least one agency tag.
              </Alert>
            )}
          </div>
          {/* Answer switch */}

          <div className="grid richtext-grid answer-section">
            <label className="form-label" id="answer-row">
              Answer your own question
              <Switch
                colorScheme="green"
                size="md"
                defaultChecked={true}
                isDisabled={true}
              />
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
