import { QuestionsDisplayState, QuestionSortState } from './questions'
import { QuestionsHeader } from '../QuestionsHeader/QuestionsHeader.component'
import { Box } from '@chakra-ui/react'
import QuestionsList from '../QuestionsList/QuestionsList.component'

interface QuestionsProps {
  questionsDisplayState: QuestionsDisplayState
  setQuestionsDisplayState: (state: QuestionsDisplayState) => void
  sortState: QuestionSortState
  setSortState: (sortState: QuestionSortState) => void
  agencyId?: number
  tags?: string // TODO: tags unused, to remove dead code?
  topics?: string
  questionsPerPage: number
  showViewAllQuestionsButton: boolean
  listAnswerable?: boolean
}
export const Questions = ({
  questionsDisplayState,
  setQuestionsDisplayState,
  sortState,
  setSortState,
  agencyId,
  tags,
  topics,
  questionsPerPage,
  showViewAllQuestionsButton,
  listAnswerable,
}: QuestionsProps): JSX.Element => {
  return (
    <Box flex="5">
      <QuestionsHeader
        // TODO remove props using Context
        questionsDisplayState={questionsDisplayState}
        sortState={sortState}
        setSortState={setSortState}
      />
      <QuestionsList
        sort={sortState.value}
        setQuestionsDisplayState={setQuestionsDisplayState}
        topics={topics}
        // TODO remove props above using Context
        agencyId={agencyId}
        tags={tags}
        questionsPerPage={questionsPerPage}
        showViewAllQuestionsButton={showViewAllQuestionsButton}
        listAnswerable={listAnswerable}
      />
    </Box>
  )
}
