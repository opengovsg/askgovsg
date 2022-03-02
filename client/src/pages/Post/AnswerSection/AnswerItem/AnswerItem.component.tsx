import { Flex, Text } from '@chakra-ui/react'

import { RichTextPreview } from '../../../../components/RichText/RichTextEditor.component'

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
      <Text color="primary.500" textStyle="subhead-3">
        ANSWER
      </Text>
      <RichTextPreview value={body} />
    </Flex>
  )
}

export default AnswerItem
