import { EditorState, convertToRaw, ContentState } from 'draft-js'
import { FC, useEffect, useState } from 'react'

import './RichTextEditor.styles.scss'

import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import { Editor, EditorProps } from 'react-draft-wysiwyg'

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import styles from './RichTextEditor.module.scss'
import { RefCallBack } from 'react-hook-form'

import { LinkControl } from './LinkControl'
import { ApiClient, getApiErrorMessage } from '../../api'
import { useStyledToast } from '../StyledToast/StyledToast'
import { PreviewLinkDecorator } from './LinkDecorator'

type UploadCallback = (
  file: File,
) => Promise<{ data: { link: string } } | undefined>

const ExtendedEditor = (props: EditorProps) => <Editor {...props} />

const TOOLBAR_OPTIONS = {
  options: ['inline', 'list', 'link'],
  inline: {
    options: ['bold', 'italic'],
  },
  link: {
    defaultTargetOption: '_blank',
    showOpenOptionOnHover: false,
    component: LinkControl,
  },
}

const toolbarWithImageUpload = (uploadCallback: UploadCallback) => {
  return {
    ...TOOLBAR_OPTIONS,
    options: TOOLBAR_OPTIONS.options.concat('image'),
    image: {
      uploadEnabled: true,
      uploadCallback,
      previewImage: true,
    },
  }
}

const createEditorStateFromHTML = (value: string) => {
  const contentBlock = htmlToDraft(value)
  if (contentBlock) {
    const contentState = ContentState.createFromBlockArray(
      contentBlock.contentBlocks,
    )
    return EditorState.createWithContent(contentState)
  }
  return EditorState.createEmpty()
}

export const RichTextEditor: FC<{
  onChange: (outputHTML: string) => void
  placeholder?: string
  readOnly?: boolean
  editorRef?: RefCallBack
  value: string
  wrapperStyle?: Record<string, string>
  editorStyle?: Record<string, string>
}> = ({
  onChange,
  placeholder,
  readOnly,
  value,
  editorRef,
  wrapperStyle = {},
  editorStyle = {},
}) => {
  const toast = useStyledToast()
  // usage of context in the future for subcomponents?
  const [editorState, setEditorState] = useState(() => {
    if (value) return createEditorStateFromHTML(value)
    return EditorState.createEmpty()
  })

  useEffect(() => {
    // reset state upon submission
    if (!value) {
      setEditorState(createEditorStateFromHTML(value))
    }
    const currentContent = editorState.getCurrentContent()
    const html = draftToHtml(convertToRaw(currentContent))
    onChange(html)
  }, [editorState, onChange, value])

  const uploadCallback = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file, file.name)
    try {
      return ApiClient.post('/files', formData)
    } catch (error) {
      toast({
        status: 'error',
        description: getApiErrorMessage(error),
      })
      return undefined
    }
  }

  return (
    <ExtendedEditor
      placeholder={placeholder}
      editorState={editorState}
      onEditorStateChange={setEditorState}
      wrapperClassName={styles.wrapper}
      editorClassName={styles.editor}
      toolbarClassName={styles.toolbar}
      // Prop styles override CSS styles
      wrapperStyle={wrapperStyle}
      editorStyle={editorStyle}
      toolbar={toolbarWithImageUpload(uploadCallback)}
      readOnly={readOnly ? readOnly : false}
      stripPastedStyles
      editorRef={editorRef}
    />
  )
}

export const RichTextPreview: FC<{
  placeholder?: string
  value: string
  editorClassName?: string
}> = ({ placeholder, value, editorClassName }) => {
  const [editorState, setEditorState] = useState(() => {
    if (value) return createEditorStateFromHTML(value)
    return EditorState.createEmpty()
  })

  useEffect(() => {
    const state = createEditorStateFromHTML(value)
    setEditorState(state)
  }, [value])

  return (
    <ExtendedEditor
      editorState={editorState}
      onEditorStateChange={setEditorState}
      placeholder={placeholder}
      editorClassName={editorClassName}
      customDecorators={[PreviewLinkDecorator]}
      toolbar={{ link: { showOpenOptionOnHover: false } }}
      readOnly
      toolbarHidden
    />
  )
}

export const RichTextFrontPreview: FC<{
  placeholder?: string
  value: string
}> = ({ placeholder, value }) => {
  return (
    <RichTextPreview
      placeholder={placeholder}
      value={value}
      editorClassName={styles.previewEditor}
    />
  )
}
