import { Box, Text } from '@chakra-ui/react'
import { RichTextPreview } from '../../../components/RichText/RichTextEditor.component'

const QuestionSection = ({
  post,
}: {
  post?: { description: string }
}): JSX.Element => {
  return (
    <Box pr="16px" mb="32px">
      {post?.description && (
        <Text textStyle="body-1" color="secondary.800">
          <RichTextPreview value={post.description} />
        </Text>
      )}
    </Box>
  )
}

export default QuestionSection
