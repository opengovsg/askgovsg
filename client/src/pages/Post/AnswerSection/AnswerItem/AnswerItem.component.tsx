import { RichTextPreview } from '../../../../components/RichText/RichTextEditor.component'
import { Flex, Text } from '@chakra-ui/react'

const AnswerItem = ({
  answer: { body },
}: {
  answer: { body: string }
}): JSX.Element => {
  return (
    <Flex
      direction="column"
      border="1px"
      borderRadius="5px"
      p="30px"
      borderColor="neutral.300"
    >
      <Text color="secondary.500" textStyle="subhead-3">
        ANSWER
      </Text>
      <RichTextPreview value={body} />
    </Flex>
  )
}

export default AnswerItem
