import { EditorState, convertToRaw, ContentState, ContentBlock } from 'draft-js'
import { FC, useEffect, useState, createContext } from 'react'

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
import { FileUploadDto } from '~shared/types/api'

import { ImageControl } from './ImageControl'
import { ImageBlock } from './ImageBlock'

export type UploadCallback = (
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
      alt: { present: true, mandatory: true },
      component: ImageControl,
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

export const EditorContext = createContext(EditorState.createEmpty())

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

  function renderBlock(block: ContentBlock): unknown | void {
    if (block.getType() === 'atomic') {
      const contentState = editorState.getCurrentContent()
      const entityKey = block.getEntityAt(0)

      if (entityKey) {
        const entity = contentState.getEntity(entityKey)
        if (entity?.getType() === 'IMAGE') {
          return {
            component: ImageBlock,
            editable: false,
          }
        }
      }
    }
  }

  const uploadCallback = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file, file.name)
    try {
      return ApiClient.post<FormData, { data: FileUploadDto }>(
        '/files',
        formData,
      )
    } catch (error) {
      toast({
        status: 'error',
        description: getApiErrorMessage(error),
      })
      return undefined
    }
  }

  return (
    <EditorContext.Provider value={editorState}>
      <ExtendedEditor
        placeholder={placeholder}
        editorState={editorState}
        onEditorStateChange={setEditorState}
        wrapperClassName={styles.wrapper}
        editorClassName={styles.editor}
        toolbarClassName={styles.toolbar}
        customBlockRenderFunc={renderBlock}
        // Prop styles override CSS styles
        wrapperStyle={wrapperStyle}
        editorStyle={editorStyle}
        toolbar={toolbarWithImageUpload(uploadCallback)}
        readOnly={readOnly ? readOnly : false}
        stripPastedStyles
        editorRef={editorRef}
      />
    </EditorContext.Provider>
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

  function renderBlock(block: ContentBlock): unknown | void {
    if (block.getType() === 'atomic') {
      const contentState = editorState.getCurrentContent()
      const entityKey = block.getEntityAt(0)

      if (entityKey) {
        const entity = contentState.getEntity(entityKey)
        if (entity?.getType() === 'IMAGE') {
          return {
            component: ImageBlock,
            editable: false,
            props: {
              readOnly: true,
            },
          }
        }
      }
    }
  }

  return (
    <EditorContext.Provider value={editorState}>
      <ExtendedEditor
        editorState={editorState}
        onEditorStateChange={setEditorState}
        placeholder={placeholder}
        editorClassName={editorClassName}
        customDecorators={[PreviewLinkDecorator]}
        customBlockRenderFunc={renderBlock}
        toolbar={{ link: { showOpenOptionOnHover: false } }}
        readOnly
        toolbarHidden
      />
    </EditorContext.Provider>
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
