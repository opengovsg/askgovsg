import {
  QuestionsDisplayState,
  QuestionSortState,
} from '../Questions/questions'
import { Flex, Stack, Text } from '@chakra-ui/react'
import { SortQuestionsMenu } from '../SortQuestionsMenu/SortQuestionsMenu.component'
import PostQuestionButton from '../PostQuestionButton/PostQuestionButton.component'
import { isUserPublicOfficer } from '../../services/user.service'
import { useAuth } from '../../contexts/AuthContext'

interface QuestionsHeaderProps {
  questionsDisplayState: QuestionsDisplayState
  sortState: QuestionSortState
  setSortState: (sortState: QuestionSortState) => void
}
export const QuestionsHeader = ({
  questionsDisplayState,
  sortState,
  setSortState,
}: QuestionsHeaderProps): JSX.Element => {
  const { user } = useAuth()
  const isAuthenticatedOfficer = user !== null && isUserPublicOfficer(user)

  return (
    <Flex
      flexDir={{ base: 'column-reverse', sm: 'row' }}
      mb={5}
      justifyContent="space-between"
    >
      <Text
        color="primary.500"
        textStyle="subhead-3"
        mt={{ base: '32px', sm: 0 }}
        mb={{ sm: '20px' }}
        d="block"
      >
        {questionsDisplayState.label}
      </Text>
      <Stack
        spacing={{ base: 2, sm: 4 }}
        direction={{ base: 'column', md: 'row' }}
      >
        <SortQuestionsMenu
          questionsDisplayState={questionsDisplayState}
          sortState={sortState}
          setSortState={setSortState}
        />
        {isAuthenticatedOfficer && <PostQuestionButton />}
      </Stack>
    </Flex>
  )
}
