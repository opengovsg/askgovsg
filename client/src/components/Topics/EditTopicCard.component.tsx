import { ReactElement, useRef } from 'react'
import { IconType } from 'react-icons'
import { BiCheck, BiDotsVerticalRounded, BiPlus } from 'react-icons/bi'
import {
  CSSObject,
  EditableInput,
  EditablePreview,
  Flex,
  IconButton,
  Spacer,
  useEditableState,
  useMultiStyleConfig,
  useOutsideClick,
} from '@chakra-ui/react'

const ConfirmEditButton = (): ReactElement => {
  const { onSubmit } = useEditableState()
  return (
    <IconButton
      aria-label={'Create topic'}
      icon={<BiCheck />}
      variant="ghost"
      onClick={(e) => {
        e.stopPropagation()
        onSubmit()
      }}
    />
  )
}

export enum NonEditIconNameEnum {
  BiPlus,
  BiDotsVerticalRounded,
}

interface EditTopicCardProps {
  nonEditIconName: NonEditIconNameEnum
  style: CSSObject
}

export const EditTopicCard = ({
  nonEditIconName,
  style,
}: EditTopicCardProps): ReactElement => {
  const getNonEditIcon = (NonEditIconName: NonEditIconNameEnum): IconType => {
    switch (NonEditIconName) {
      case NonEditIconNameEnum.BiPlus:
        return BiPlus
      case NonEditIconNameEnum.BiDotsVerticalRounded:
        return BiDotsVerticalRounded
    }
  }
  const NonEditIcon = getNonEditIcon(nonEditIconName)
  const { isEditing, onCancel, onEdit } = useEditableState()
  const styles = useMultiStyleConfig('OptionsMenu', {})
  const ref = useRef(null)
  useOutsideClick({
    ref,
    handler: () => onCancel(),
  })
  return (
    <div ref={ref}>
      <Flex
        sx={style}
        _hover={{ bg: 'secondary.600', boxShadow: 'lg' }}
        role="group"
        m="auto"
        w="100%"
        pl={8}
        pr={isEditing ? 5 : 8}
        onClick={onEdit}
      >
        <Flex>
          <EditablePreview />
          <EditableInput sx={styles.accordionEditableInput} />
        </Flex>

        <Spacer />
        <Flex alignItems="center">
          {isEditing ? <ConfirmEditButton /> : <NonEditIcon />}
        </Flex>
      </Flex>
    </div>
  )
}
