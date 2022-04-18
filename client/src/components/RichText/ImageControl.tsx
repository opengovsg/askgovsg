import {
  ChangeEvent,
  DragEvent,
  MouseEvent,
  MouseEventHandler,
  useState,
} from 'react'
import { BiCloudUpload, BiImage, BiTrash } from 'react-icons/bi'
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  useMultiStyleConfig,
  VStack,
} from '@chakra-ui/react'

import { UploadCallback } from './RichTextEditor.component'

// ImageControl replaces the pre-built image popup
// https://jpuri.github.io/react-draft-wysiwyg/#/docs
// Under Using custom react component for pre-built toolbar options
interface ImageControlProps {
  expanded: boolean
  onChange: (key: string, ...vals: string[]) => void
  doCollapse: () => void
  onExpandEvent: () => void
  config: {
    uploadCallback: UploadCallback
    inputAccept: string
  }
}

export const ImageControl = ({
  onChange,
  config,
}: ImageControlProps): JSX.Element => {
  const styles = useMultiStyleConfig('ImageControl', {})

  const [imgSrc, setImgSrc] = useState('')
  const [alt, setAlt] = useState('')
  const [fileUpload, setFileUpload] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const WIDTH = '100%'

  const {
    onOpen: onImageModalOpen,
    onClose: onImageModalClose,
    isOpen: isImageModalOpen,
  } = useDisclosure()

  const stopPropagation = (e: MouseEvent<HTMLElement>) => {
    if (!fileUpload) {
      e.preventDefault()
      e.stopPropagation()
    } else {
      setFileUpload(false)
    }
  }

  const handleCancel: MouseEventHandler<HTMLButtonElement> = () => {
    onImageModalClose()
    setImgSrc('')
    setAlt('')
  }

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    onChange(imgSrc, 'auto', WIDTH, alt)
    onImageModalClose()
    setImgSrc('')
    setAlt('')
  }
  const fileUploadClick = (e: MouseEvent<HTMLElement>) => {
    setFileUpload(true)
    e.stopPropagation()
  }

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsDragOver(true)
  }

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsDragOver(false)
  }

  const toggleShowImageLoading = () => {
    setImageLoading(!imageLoading)
  }

  const uploadImage = (file: File) => {
    toggleShowImageLoading()
    setFileName(file.name)
    const fileSizeConverted = Math.round(file.size / 10) / 100
    setFileSize(fileSizeConverted)
    const { uploadCallback } = config
    uploadCallback(file)
      .then((res) => {
        if (res) {
          setImgSrc(res.data.link)
          setFileUpload(false)
          setImageLoading(false)
        }
      })
      .catch(() => {
        setImageLoading(false)
      })
  }

  const onImageDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
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

  const selectImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadImage(e.target.files[0])
    }
  }

  const renderModal = () => (
    <Modal isOpen={isImageModalOpen} onClose={onImageModalClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="680px">
        <ModalBody>
          <div onClick={stopPropagation}>
            <VStack align="stretch">
              <Text sx={styles.titleText}>Insert Image</Text>
              <Tabs variant="unstyled">
                <TabList h="56px">
                  <Tab sx={styles.tabText}>
                    <Text textStyle="subhead-1">File Upload</Text>
                  </Tab>
                </TabList>
                <Divider sx={styles.tabDivider} />
                <TabPanels>
                  <TabPanel>
                    <Text sx={styles.fileUploadFormatText}>
                      Upload a jpg, jpeg, png, or gif
                    </Text>
                    {imageLoading ? (
                      <Spinner />
                    ) : imgSrc ? (
                      <Box sx={styles.uploadedLargeBox}>
                        <Flex sx={styles.uploadedImageFlexBox}>
                          <Image
                            src={imgSrc}
                            alt={alt}
                            width={WIDTH}
                            className="rdw-image-modal-upload-option-image-preview"
                            onLoad={() => setImageLoading(false)}
                          />
                        </Flex>
                        <HStack justifyContent="space-between">
                          <Box>
                            <Text textStyle="subhead-1" mb="4px">
                              {fileName}
                            </Text>
                            <Text textStyle="caption-1">{fileSize} KB</Text>
                          </Box>
                          <Box justifyContent="flex-end" pr="12px">
                            <BiTrash
                              size="17px"
                              color="#C05050"
                              cursor="pointer"
                              onClick={() => setImgSrc('')}
                            />
                          </Box>
                        </HStack>
                      </Box>
                    ) : (
                      <VStack alignContent="left" alignItems="left">
                        <Box
                          bg={isDragOver ? 'secondary.200' : 'secondary.100'}
                          border={isDragOver ? '1px' : '2px'}
                          borderColor={
                            isDragOver ? 'Secondary.800' : 'neutral.700'
                          }
                          borderStyle={isDragOver ? 'solid' : 'dashed'}
                          sx={styles.fileUploadBox}
                          onClick={fileUploadClick}
                          onDragEnter={onDragEnter}
                          onDragOver={stopPropagation}
                          onDragLeave={onDragLeave}
                          onDrop={onImageDrop}
                          cursor="pointer"
                          className="image-modal-upload-box"
                        >
                          <label
                            htmlFor="file"
                            className="rdw-image-modal-upload-option-label"
                          >
                            {isDragOver ? (
                              <Text sx={styles.dragOverText}>
                                Drop media to upload
                              </Text>
                            ) : (
                              <Flex>
                                <VStack>
                                  <BiCloudUpload size="50px" />
                                  <Flex>
                                    <Text sx={styles.fileUploadText} as="u">
                                      Choose file
                                    </Text>
                                    <Text sx={styles.fileUploadText}>
                                      &nbsp;or drag and drop here
                                    </Text>
                                  </Flex>
                                </VStack>
                              </Flex>
                            )}
                          </label>
                          <Input
                            type="file"
                            id="file"
                            accept={config.inputAccept}
                            onChange={selectImage}
                            className="rdw-image-modal-upload-option-input"
                          />
                        </Box>
                        <Text sx={styles.maxFileSizeText}>
                          Maximum file size: 10MB
                        </Text>
                      </VStack>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
              {imgSrc ? (
                <Box>
                  <Box sx={styles.altTextBox}>
                    <Text textStyle="subhead-1">Alt text</Text>
                    <Text textStyle="body-2">
                      Alt text (text that describes this media) improves
                      accessibility for people who can’t see images on web
                      pages, including users who use screen readers. This text
                      will not appear on your page.
                    </Text>
                  </Box>
                  <Box px="16px">
                    <Input
                      value={alt}
                      isRequired
                      placeholder="e.g. Table of the different quarantine types"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setAlt(e.target.value)
                      }
                    />
                  </Box>
                </Box>
              ) : null}
            </VStack>
          </div>
          <Divider sx={styles.divider} />
        </ModalBody>
        <ModalFooter>
          <Flex sx={styles.buttonsFlexBox}>
            <Button sx={styles.cancelButton} onClick={handleCancel}>
              Cancel
            </Button>
            <Box w="8px"></Box>
            <Button
              sx={styles.submitButton}
              onClick={handleSubmit}
              isDisabled={!imgSrc || !alt}
            >
              Insert Image
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )

  return (
    <Box display={{ base: 'none', xl: 'block' }} mb="6px">
      <Box onClick={onImageModalOpen} className="rdw-option-wrapper">
        <BiImage size="18px" />
      </Box>
      {renderModal()}
    </Box>
  )
}
