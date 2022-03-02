import { Box, Text, SkeletonText } from '@chakra-ui/react'
import { GetAnswersForPostDto } from '../../../api'
import { sortByCreatedAt } from '../../../util/date'
import AnswerItem from './AnswerItem/AnswerItem.component'

const AnswerSection = ({
  answers,
}: {
  answers?: GetAnswersForPostDto
}): JSX.Element => {
  return !answers ? (
    <SkeletonText />
  ) : (
    <Box className="answer-section" w="auto" float="none">
      {answers && answers.length > 0 ? (
        answers?.sort(sortByCreatedAt).map((answer) => (
          <Box className="answers" w="100%" mb="16px" color="neutral.900">
            <AnswerItem answer={answer} />
          </Box>
        ))
      ) : (
        <Box
          className="answer-header"
          w="100%"
          borderTop="1px solid"
          borderColor="neutral.300"
          my="16px"
        >
          <Text textStyle="h2" color="primary.800">
            No official answers yet
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default AnswerSection
