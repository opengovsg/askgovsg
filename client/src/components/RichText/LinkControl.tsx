import { ChangeEvent, MouseEvent, MouseEventHandler, useState } from 'react'
import { BiLink } from 'react-icons/bi'
import { Box, Button, HStack, Input, Text } from '@chakra-ui/react'

import { useStyledToast } from '../StyledToast/StyledToast'

import styles from './RichTextEditor.module.scss'

// LinkControl replaces the pre-built link popup
// https://jpuri.github.io/react-draft-wysiwyg/#/docs
// Under Using custom react component for pre-built toolbar options
interface LinkControlProps {
  currentState: {
    link: {
      title: string
      target: string
    }
    selectionText: string
  }
  expanded: boolean
  onChange: (key: string, ...vals: string[]) => void
  doExpand: () => void
  doCollapse: () => void
  onExpandEvent: () => void
}

export const LinkControl = ({
  currentState,
  expanded,
  onChange,
  onExpandEvent,
}: LinkControlProps): JSX.Element => {
  const [title, setTitle] = useState('')
  const [url, setURL] = useState('')
  const toast = useStyledToast()

  const signalExpandShowModal = () => {
    const { link, selectionText } = currentState
    if ((link && link.title) || selectionText) {
      onExpandEvent()
      setTitle((link && link.title) || selectionText)
      setURL((link && link.target) || '')
    } else {
      toast({
        status: 'error',
        description: 'Highlight text to link',
      })
    }
  }

  const stopPropagation = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
  }

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onChange('link', title, url, '_blank')
  }

  const renderModal = () => (
    <div onClick={stopPropagation} className={styles.form}>
      <Box w="376px" h="128px" p="24px">
        <Text textStyle="subhead1" color="secondary.800">
          Add Target Link
        </Text>
        <HStack spacing="16px" my="12px">
          <Input
            value={url}
            type="text"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setURL(e.target.value)
            }
          />
          <Button
            textStyle="body1"
            backgroundColor="secondary.700"
            color="white"
            onClick={handleSubmit}
            name="link_button"
            isDisabled={!title || !url}
            _hover={undefined}
            _active={undefined}
            _focus={undefined}
          >
            Save
          </Button>
        </HStack>
      </Box>
    </div>
  )
  return (
    <Box position="relative" mb="6px">
      <Box onClick={signalExpandShowModal} className="rdw-option-wrapper">
        <BiLink size="18px" />
      </Box>
      {expanded ? renderModal() : undefined}
    </Box>
  )
}
