import { QuestionsHeader } from '../QuestionsHeader/QuestionsHeader.component'
import { Box } from '@chakra-ui/react'
import QuestionsList from '../QuestionsList/QuestionsList.component'
import { useContext, useEffect } from 'react'
import { HomePageContext } from '../../contexts/HomePageContext'
import { useLocation } from 'react-router-dom'
import { getTopicsQuery, isSpecified } from '../../util/urlparser'
import { QuestionsDisplayState, questionsDisplayStates } from './questions'

interface QuestionsProps {
  agencyId?: number
  tags?: string // TODO: tags unused, to remove dead code?
  questionsPerPage?: number
  showViewAllQuestionsButton?: boolean
  listAnswerable?: boolean
}
export const Questions = ({
  agencyId,
  tags,
  questionsPerPage,
  showViewAllQuestionsButton,
  listAnswerable,
}: QuestionsProps): JSX.Element => {
  const {
    questionsDisplayState,
    setQuestionsDisplayState,
    topicQueryState,
    setTopicQueryState,
    hasTopicsKey,
    setHasTopicsKey,
  } = useContext(HomePageContext)
  const location = useLocation()

  // hacky solution to update questionDisplayState based on url
  // major refactoring required to decouple topics and all posts
  // current complexity caused by adapting code meant for tags for topics, afaict
  useEffect(() => {
    setTopicQueryState(getTopicsQuery(location.search))
    const topicsSpecified = isSpecified(location.search, 'topics')
    setHasTopicsKey(topicsSpecified)
    if (hasTopicsKey) {
      topicQueryState //  hasTopicsKey && topicQueryState implies specific topic selected
        ? setQuestionsDisplayState(
            questionsDisplayStates.find(
              (state) => state.value === 'topic',
            ) as QuestionsDisplayState,
          )
        : // hasTopicsKey && !topicQueryState implies all topics selected
          setQuestionsDisplayState(
            questionsDisplayStates.find(
              (state) => state.value === 'all',
            ) as QuestionsDisplayState,
          )
    } else {
      // if both are false, only show top questions
      setQuestionsDisplayState(
        questionsDisplayStates.find(
          (state) => state.value === 'top',
        ) as QuestionsDisplayState,
      )
    }
  }, [location, hasTopicsKey, topicQueryState])
  return (
    <Box flex="5">
      <QuestionsHeader />
      <QuestionsList
        agencyId={agencyId}
        tags={tags}
        questionsPerPage={
          questionsPerPage || questionsDisplayState.questionsPerPage
        }
        showViewAllQuestionsButton={
          showViewAllQuestionsButton || questionsDisplayState.value !== 'all'
        }
        listAnswerable={listAnswerable}
      />
    </Box>
  )
}
