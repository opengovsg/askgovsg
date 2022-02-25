import { QuestionsDisplayState, QuestionSortState } from './questions'
import { QuestionsHeader } from '../QuestionsHeader/QuestionsHeader.component'
import { Box } from '@chakra-ui/react'
import QuestionsList from '../QuestionsList/QuestionsList.component'
import { NavigateFunction } from 'react-router-dom'

interface QuestionsProps {
  questionsDisplayState: QuestionsDisplayState
  setQuestionsDisplayState: (state: QuestionsDisplayState) => void
  sortState: QuestionSortState
  setSortState: (sortState: QuestionSortState) => void
  isAuthenticatedOfficer: boolean
  agencyId?: number
  tags?: string
  topics?: string
  questionsPerPage: number
  navigate: NavigateFunction
  showViewAllQuestionsButton: boolean
  listAnswerable?: boolean
}
export const Questions = ({
  questionsDisplayState,
  setQuestionsDisplayState,
  sortState,
  setSortState,
  isAuthenticatedOfficer,
  agencyId,
  tags,
  topics,
  questionsPerPage,
  navigate,
  showViewAllQuestionsButton,
  listAnswerable,
}: QuestionsProps): JSX.Element => {
  return (
    <Box flex="5">
      <QuestionsHeader
        questionsDisplayState={questionsDisplayState}
        sortState={sortState}
        setSortState={setSortState}
        isAuthenticatedOfficer={isAuthenticatedOfficer}
      />
      <QuestionsList
        sort={sortState.value}
        agencyId={agencyId}
        tags={tags}
        topics={topics}
        questionsPerPage={questionsPerPage}
        showViewAllQuestionsButton={showViewAllQuestionsButton}
        navigate={navigate}
        setQuestionsDisplayState={setQuestionsDisplayState}
        listAnswerable={listAnswerable}
      />
    </Box>
  )
}
