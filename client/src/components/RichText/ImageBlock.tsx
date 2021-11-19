import {
  ContentBlock,
  ContentState,
  EditorState,
  SelectionState,
  Modifier,
} from 'draft-js'
import { useRef, useState, useContext } from 'react'
import {
  useMultiStyleConfig,
  Button,
  ButtonGroup,
  Divider,
  HStack,
  Box,
  Image,
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

  const styles = useMultiStyleConfig('ImageEdit', {})

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

  function renderPreviewImage() {
    return (
      <img ref={imageRef} src={src} width={width} height={height} alt={alt} />
    )
  }

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
        alt={alt}
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
          <Button sx={styles.removeButton} onClick={handleRemove}>
            Remove
          </Button>
        </HStack>
      )}
    </Box>
  )
}
