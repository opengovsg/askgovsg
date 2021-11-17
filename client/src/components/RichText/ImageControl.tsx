import {
  Button,
  VStack,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Flex,
  Box,
  Image,
  Spinner,
} from '@chakra-ui/react'
import { MouseEventHandler, useState } from 'react'
import { BiImage } from 'react-icons/bi'
import styles from './RichTextEditor.module.scss'
import { UploadCallback } from './RichTextEditor.component'

// ImageControl replaces the pre-built image popup
// https://jpuri.github.io/react-draft-wysiwyg/#/docs
// Under Using custom react component for pre-built toolbar options
interface ImageControlProps {
  // currentState: {
  //   imgSrc: string
  //   alt: string
  // }
  expanded: boolean
  onChange: (key: string, ...vals: string[]) => void
  // doExpand: () => void
  doCollapse: () => void
  onExpandEvent: () => void
  config: {
    uploadCallback: UploadCallback
    inputAccept: string
  }
}

export const ImageControl = ({
  // currentState,
  expanded,
  onChange,
  // doExpand,
  doCollapse,
  onExpandEvent,
  config,
}: ImageControlProps): JSX.Element => {
  // const editorState = useContext(EditorContext)
  const [imgSrc, setImgSrc] = useState('')
  const [alt, setAlt] = useState('')
  const [dragEnter, setDragEnter] = useState(false)
  const [fileUpload, setFileUpload] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  const stopPropagation = (e: React.MouseEvent<HTMLElement>) => {
    if (!fileUpload) {
      e.preventDefault()
      e.stopPropagation()
    } else {
      setFileUpload(false)
    }
  }

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    onChange(imgSrc, 'auto', '100%', alt)
  }
  const fileUploadClick = (e: React.MouseEvent<HTMLElement>) => {
    setFileUpload(true)
    e.stopPropagation()
  }

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setDragEnter(true)
  }

  const toggleShowImageLoading = () => {
    setImageLoading(!imageLoading)
  }

  const isInputPopulated = () => {
    if (imgSrc) setImageLoading(false)
    else setImageLoading(true)
  }

  const uploadImage = (file: File) => {
    toggleShowImageLoading()
    const { uploadCallback } = config
    uploadCallback(file)
      .then((res) => {
        if (res) {
          setDragEnter(false)
          setImgSrc(res.data.link)
          setFileUpload(false)
          setImageLoading(false)
        }
      })
      .catch(() => {
        setDragEnter(false)
        setImageLoading(false)
      })
  }

  const onImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragEnter(false)

    // Check if property name is files or items
    // IE uses 'files' instead of 'items'
    let data
    let dataIsItems
    if (e.dataTransfer.items) {
      data = e.dataTransfer.items
      dataIsItems = true
    } else {
      data = e.dataTransfer.files
      dataIsItems = false
    }
    for (let i = 0; i < data.length; i += 1) {
      if (
        (!dataIsItems ||
          (data instanceof DataTransferItemList && data[i].kind === 'file')) &&
        data[i].type.match('^image/')
      ) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const file = dataIsItems ? data[i].getAsFile() : data[i]
        uploadImage(file)
      }
    }
  }

  const selectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadImage(e.target.files[0])
    }
  }

  const renderModal = () => (
    <div onClick={stopPropagation} className={styles.form}>
      <Flex w="680px" px="32px">
        <VStack my="12px" align="stretch">
          <Text textAlign="left" textStyle="subhead-1">
            Upload an image
          </Text>
          {imageLoading ? (
            <Spinner />
          ) : (
            <Box
              w="100px"
              h="100px"
              bg="secondary.100"
              onClick={fileUploadClick}
            >
              <Box
                onDragEnter={onDragEnter}
                onDragOver={stopPropagation}
                onDrop={onImageDrop}
              >
                <label
                  htmlFor="file"
                  className="rdw-image-modal-upload-option-label"
                >
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={alt}
                      className="rdw-image-modal-upload-option-image-preview"
                    />
                  ) : (
                    <Text> Drop image here</Text>
                  )}
                </label>
              </Box>
              {/* Chakra UI does not have a file uploader component */}
              <input
                type="file"
                id="file"
                accept={config.inputAccept}
                onChange={selectImage}
                className="rdw-image-modal-upload-option-input"
              />
            </Box>
          )}

          <Text textAlign="left" textStyle="subhead-1">
            Paste image URL
          </Text>
          <InputGroup>
            <Input
              value={imgSrc}
              type="text"
              placeholder="http://"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setImgSrc(e.target.value)
                isInputPopulated()
              }}
            />
            <InputRightElement>
              {imageLoading ? <Spinner /> : null}
            </InputRightElement>
          </InputGroup>
          {imgSrc ? (
            <VStack>
              <Text textAlign="left" textStyle="subhead-1">
                Image preview
              </Text>
              <Image
                src={imgSrc}
                alt={alt}
                className="rdw-image-modal-upload-option-image-preview"
                onLoad={() => setImageLoading(false)}
              />
            </VStack>
          ) : (
            <Text>Image not loaded</Text>
          )}

          <Text textStyle="subhead-1">Alt text</Text>
          <Text textStyle="body-2">
            Alt text (text that describes this media) improves accessibility for
            people who can’t see images on web pages, including users who use
            screen readers. This text will not appear on your page.
          </Text>
          <Input
            value={alt}
            isRequired
            placeholder="e.g. Table of the different quarantine types"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAlt(e.target.value)
            }
          />
          <Flex alignContent="right">
            <Button
              textStyle="subhead-1"
              backgroundColor="white"
              onClick={doCollapse}
              name="img_url_button"
              _hover={undefined}
              _active={undefined}
              _focus={undefined}
            >
              Cancel
            </Button>
            <Button
              textStyle="subhead-1"
              backgroundColor="secondary.700"
              color="white"
              onClick={handleSubmit}
              name="img_url_button"
              isDisabled={!imgSrc || !alt}
              _hover={undefined}
              _active={undefined}
              _focus={undefined}
            >
              Insert Image
            </Button>
          </Flex>
        </VStack>
      </Flex>
    </div>
  )

  return (
    <div className={styles.imageControl}>
      <div onClick={onExpandEvent} className="rdw-option-wrapper">
        <BiImage size="18px" />
      </div>
      {expanded ? renderModal() : undefined}
    </div>
  )
}
