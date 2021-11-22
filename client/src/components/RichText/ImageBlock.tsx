import {
  ContentBlock,
  ContentState,
  EditorState,
  SelectionState,
  Modifier,
} from 'draft-js'
import { useRef, useState, useContext, ChangeEvent, MouseEvent } from 'react'
import {
  useMultiStyleConfig,
  Button,
  ButtonGroup,
  Divider,
  HStack,
  Box,
  Flex,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  useDisclosure,
  VStack,
  Text,
  Input,
} from '@chakra-ui/react'

import { EditorContext } from './RichTextEditor.component'

export const ImageBlock = ({
  block,
  contentState,
  blockProps,
}: {
  block: ContentBlock
  contentState: ContentState
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockProps: any
}): JSX.Element => {
  const { editorState, setEditorState } = useContext(EditorContext)
  const readOnly = blockProps?.readOnly
  const imageRef = useRef<HTMLImageElement>(null)
  const [showPopover, setShowPopover] = useState(false)
  const entity = contentState.getEntity(block.getEntityAt(0))
  const { src, width, height, alt } = entity.getData()
  const imageSizeOptions: number[] = [50, 75, 100]
  const [currentImageSize, setCurrentImageSize] = useState(
    width ? convertWidthToInt(width) : 100,
  )
  const [altText, setAltText] = useState(alt)

  const styles = useMultiStyleConfig('ImageBlock', {})
  const editImageStyles = useMultiStyleConfig('ImageControl', {})

  const {
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
    isOpen: isEditModalOpen,
  } = useDisclosure()

  function convertWidthToInt(widthString: string) {
    const width = parseInt(widthString.substring(0, widthString.length - 1))
    return width
  }

  function hidePopover() {
    if (imageRef.current) setShowPopover(false)
  }

  function handleClick() {
    if (!showPopover) {
      setShowPopover(true)
      // Set listener only after event has completed bubbling to prevent the current event
      // from closing the popover.
      setTimeout(() => {
        window.addEventListener('click', hidePopover, {
          once: true,
        })
      })
    }
  }

  async function handleRemove() {
    const blockKey = block.getKey()

    // Clear off the entire image block content (usually empty space)
    const rangeToRemove = SelectionState.createEmpty(blockKey).merge({
      anchorKey: blockKey,
      focusKey: blockKey,
      anchorOffset: 0,
      focusOffset: block.getLength(),
    })
    let updatedContentState = Modifier.removeRange(
      contentState,
      rangeToRemove,
      'forward',
    )

    // Delete atomic block from block map
    const blockMap = updatedContentState.getBlockMap().delete(block.getKey())

    // Update selection to next block after deleting current block
    const blockAfter = contentState.getBlockAfter(blockKey)
    const blockAfterKey = blockAfter?.getKey()

    const selectionAfter = blockAfterKey
      ? SelectionState.createEmpty(blockAfterKey)
      : null

    updatedContentState = updatedContentState.merge({
      blockMap,
      selectionAfter,
    }) as ContentState

    // Push updated state to allow for undos
    const updated = EditorState.push(
      editorState,
      updatedContentState,
      'remove-range',
    )

    setEditorState(updated)
  }

  function getUpdateWidth(width: number) {
    return () => {
      // Preserve selection to prevent jumping to start of editor after setting width
      const currentSelection = editorState.getSelection()
      const entityKey = block.getEntityAt(0)
      contentState.mergeEntityData(entityKey, {
        width: `${width}%`,
      })
      const updated = EditorState.push(
        EditorState.forceSelection(editorState, currentSelection),
        contentState,
        'change-block-data',
      )

      setEditorState(updated)
      setCurrentImageSize(width)
    }
  }

  function getUpdateAlt(altText: string) {
    return () => {
      // Preserve selection to prevent jumping to start of editor after setting width
      const currentSelection = editorState.getSelection()
      const entityKey = block.getEntityAt(0)
      contentState.mergeEntityData(entityKey, {
        alt: altText,
      })
      const updated = EditorState.push(
        EditorState.forceSelection(editorState, currentSelection),
        contentState,
        'change-block-data',
      )

      setEditorState(updated)
      onEditModalClose()
    }
  }

  function handleCancelAlt() {
    onEditModalClose()
    setAltText(alt)
  }

  function renderPreviewImage() {
    return (
      <img ref={imageRef} src={src} width={width} height={height} alt={alt} />
    )
  }

  const stopPropagation = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
  }

  const renderModal = () => (
    <div onClick={stopPropagation}>
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} isCentered>
        <ModalOverlay />
        <ModalContent maxW="680px">
          <ModalBody>
            <VStack align="stretch">
              <Text sx={editImageStyles.titleText}>Edit Alt Text</Text>
              <Flex sx={editImageStyles.uploadedImageFlexBox}>
                <Image src={src} alt={alt} />
              </Flex>
              <Box>
                <Box sx={editImageStyles.altTextBox}>
                  <Text textStyle="subhead-1">Alt text</Text>
                  <Text textStyle="body-2">
                    Alt text (text that describes this media) improves
                    accessibility for people who can’t see images on web pages,
                    including users who use screen readers. This text will not
                    appear on your page.
                  </Text>
                </Box>
                <Box px="16px">
                  <Input
                    value={altText}
                    isRequired
                    placeholder="e.g. Table of the different quarantine types"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setAltText(e.target.value)
                    }
                  />
                </Box>
              </Box>
            </VStack>
            <Divider sx={editImageStyles.divider} />
          </ModalBody>
          <ModalFooter>
            <Flex sx={editImageStyles.buttonsFlexBox}>
              <Button
                sx={editImageStyles.cancelButton}
                onClick={handleCancelAlt}
              >
                Cancel
              </Button>
              <Box w="8px"></Box>
              <Button
                sx={editImageStyles.submitButton}
                onClick={getUpdateAlt(altText)}
              >
                Save
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )

  return readOnly ? (
    renderPreviewImage()
  ) : (
    <Box>
      <Image
        ref={imageRef}
        onClick={handleClick}
        src={src}
        width={width}
        height={height}
        alt={altText}
      />
      {showPopover && (
        <HStack sx={styles.popover}>
          <ButtonGroup sx={styles.buttonGroup}>
            {imageSizeOptions.map((size) => {
              return (
                <Button
                  sx={styles.button}
                  onClick={getUpdateWidth(size)}
                  isDisabled={Boolean(currentImageSize === size)}
                >
                  {size}%
                </Button>
              )
            })}
          </ButtonGroup>
          <Divider orientation="vertical" h="28px" />
          <ButtonGroup sx={styles.buttonGroup}>
            <Button sx={styles.editButton} onClick={onEditModalOpen}>
              Edit Alt Text
            </Button>
            <Button sx={styles.removeButton} onClick={handleRemove}>
              Remove
            </Button>
          </ButtonGroup>
        </HStack>
      )}
      {renderModal()}
    </Box>
  )
}
