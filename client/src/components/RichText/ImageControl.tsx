import {
  Button,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Flex,
  Box,
  Image,
  Spinner,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react'
import { MouseEventHandler, useState } from 'react'
import { BiImage, BiTrash, BiCloudUpload } from 'react-icons/bi'
import { UploadCallback } from './RichTextEditor.component'
import styles from './RichTextEditor.module.scss'
import './ImageControl.styles.scss'

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
  const [imgSrc, setImgSrc] = useState('')
  const [alt, setAlt] = useState('')
  const [fileUpload, setFileUpload] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)

  const {
    onOpen: onImageModalOpen,
    onClose: onImageModalClose,
    isOpen: isImageModalOpen,
  } = useDisclosure()

  const stopPropagation = (e: React.MouseEvent<HTMLElement>) => {
    if (!fileUpload) {
      e.preventDefault()
      e.stopPropagation()
    } else {
      setFileUpload(false)
    }
  }

  const handleCancel: MouseEventHandler<HTMLButtonElement> = (e) => {
    onImageModalClose()
    setImgSrc('')
  }

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    onChange(imgSrc, 'auto', '100%', alt)
    onImageModalClose()
    setImgSrc('')
  }
  const fileUploadClick = (e: React.MouseEvent<HTMLElement>) => {
    setFileUpload(true)
    e.stopPropagation()
  }

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
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

  const onImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

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
    <Modal isOpen={isImageModalOpen} onClose={onImageModalClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="680px">
        <ModalBody>
          <div onClick={stopPropagation} className={styles.form}>
            <VStack align="stretch">
              <Text
                textAlign="left"
                textStyle="h2"
                borderBottom="1px"
                borderBottomColor="neutral.300"
                py="16px"
              >
                Insert Image
              </Text>
              <Tabs variant="line">
                <TabList>
                  <Tab
                    _selected={{
                      borderBottom: '2px',
                      borderBottomColor: 'secondary.800',
                    }}
                  >
                    <Text textStyle="subhead-1">File Upload</Text>
                  </Tab>
                  <Tab
                    _selected={{
                      borderBottom: '2px',
                      borderBottomColor: 'secondary.800',
                    }}
                  >
                    <Text textStyle="subhead-1">Website Address URL</Text>
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Text textAlign="left" textStyle="subhead-1" pb="12px">
                      Upload a jpg, png, or gif
                    </Text>
                    {imageLoading ? (
                      <Spinner />
                    ) : imgSrc ? (
                      <Box
                        w="584px"
                        h="248px"
                        bg="secondary.100"
                        py="16px"
                        px="14px"
                      >
                        <Flex
                          w="160px"
                          h="160px"
                          px="8px"
                          py="8px"
                          mb="16px"
                          bg="white"
                          border="1px"
                          borderColor="neutral.400"
                          borderRadius="4px"
                          alignItems="center"
                          position="relative"
                        >
                          <Image
                            src={imgSrc}
                            alt={alt}
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
                          <Box justifyContent="flex-end">
                            <BiTrash
                              size="15px"
                              color="#C05050"
                              cursor="pointer"
                              onClick={() => setImgSrc('')}
                            />
                          </Box>
                        </HStack>
                      </Box>
                    ) : (
                      <Box
                        w="600px"
                        h="216px"
                        bg="secondary.100"
                        border="1px"
                        borderColor="Secondary.100"
                        borderStyle="dashed"
                        onClick={fileUploadClick}
                      >
                        <label
                          htmlFor="file"
                          className="rdw-image-modal-upload-option-label"
                        >
                          <Box
                            onDragEnter={onDragEnter}
                            onDragOver={stopPropagation}
                            onDrop={onImageDrop}
                            cursor="pointer"
                          >
                            <Flex w="100%" h="100%" alignSelf="auto">
                              <VStack>
                                <BiCloudUpload size="50px" />
                                <Flex>
                                  <Text
                                    fontFamily="Inter"
                                    fontSize="16px"
                                    color="Secondary.800"
                                    as="u"
                                  >
                                    Choose file
                                  </Text>
                                  <Text
                                    fontFamily="Inter"
                                    fontSize="16px"
                                    color="Secondary.800"
                                  >
                                    &nbsp;or drag and drop here
                                  </Text>
                                </Flex>
                              </VStack>
                            </Flex>
                          </Box>
                        </label>
                        <input
                          type="file"
                          id="file"
                          accept={config.inputAccept}
                          onChange={selectImage}
                          className="rdw-image-modal-upload-option-input"
                        />
                      </Box>
                    )}
                  </TabPanel>
                  <TabPanel>
                    {imgSrc ? (
                      <Flex
                        w="160px"
                        h="160px"
                        px="8px"
                        py="8px"
                        mb="16px"
                        mt="16px"
                        bg="white"
                        border="1px"
                        borderColor="neutral.400"
                        borderRadius="4px"
                        alignItems="center"
                        position="relative"
                      >
                        <Image
                          src={imgSrc}
                          alt={alt}
                          className="rdw-image-modal-upload-option-image-preview"
                          onLoad={() => setImageLoading(false)}
                        />
                      </Flex>
                    ) : null}
                    <Text
                      textAlign="left"
                      textStyle="subhead-1"
                      pt="16px"
                      pb="12px"
                    >
                      Paste image URL
                    </Text>
                    <InputGroup>
                      <Input
                        value={imgSrc}
                        borderColor={imgSrc ? 'success.900' : undefined}
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
                  </TabPanel>
                </TabPanels>
              </Tabs>
              {imgSrc ? (
                <Box>
                  <Box px="16px" pb="16px" pt="8px">
                    <Text textStyle="subhead-1">Alt text</Text>
                    <Text textStyle="body-2">
                      Alt text (text that describes this media) improves
                      accessibility for people who can’t see images on web
                      pages, including users who use screen readers. This text
                      will not appear on your page.
                    </Text>
                  </Box>
                  <Box px="16px" pb="32px">
                    <Input
                      value={alt}
                      isRequired
                      placeholder="e.g. Table of the different quarantine types"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAlt(e.target.value)
                      }
                    />
                  </Box>
                </Box>
              ) : null}
              {/* </Tabs> */}
            </VStack>
          </div>
        </ModalBody>
        <ModalFooter border="1px" borderColor="neutral.300">
          <Flex justifyContent="flex-end" px="16px" pb="16px">
            <Button
              textStyle="subhead-1"
              backgroundColor="white"
              onClick={handleCancel}
              name="img_url_button"
            >
              Cancel
            </Button>
            <Box w="8px"></Box>
            <Button
              textStyle="subhead-1"
              backgroundColor="secondary.700"
              color="white"
              onClick={handleSubmit}
              name="img_url_button"
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
    <div className={styles.imageControl}>
      <div onClick={onImageModalOpen} className="rdw-option-wrapper">
        <BiImage size="18px" />
      </div>
      {renderModal()}
    </div>
  )
}
