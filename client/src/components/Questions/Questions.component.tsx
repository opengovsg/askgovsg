import { useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import { HomePageContext } from '../../contexts/HomePageContext'
import { getTopicsQuery, isSpecified } from '../../util/urlparser'
import { QuestionsHeader } from '../QuestionsHeader/QuestionsHeader.component'
import QuestionsList from '../QuestionsList/QuestionsList.component'

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
    topicQueried,
    setTopicQueried,
    urlHasTopicsParamKey,
    setUrlHasTopicsParamKey,
  } = useContext(HomePageContext)
  const location = useLocation()

  /*
  hacky solution to update questionDisplayState based on url
  major refactoring required to decouple topics and all posts
  current complexity caused by adapting code meant for tags for topics, afaict
  */
  useEffect(() => {
    setTopicQueried(getTopicsQuery(location.search))
    const topicsSpecified = isSpecified(location.search, 'topics')
    setUrlHasTopicsParamKey(topicsSpecified)
    if (urlHasTopicsParamKey) {
      topicQueried // urlContainsTopics && topicQueried -> specific topic selected
        ? setQuestionsDisplayState(
            questionsDisplayStates.find(
              (state) => state.value === 'topic',
            ) as QuestionsDisplayState,
          )
        : // urlContainsTopics && !topicQueried -> view all questions irrespective of topic
          setQuestionsDisplayState(
            questionsDisplayStates.find(
              (state) => state.value === 'all',
            ) as QuestionsDisplayState,
          )
    } else {
      // !urlContainsTopics && !topicQueried -> on homepage w nothing selected; show top questions
      setQuestionsDisplayState(
        questionsDisplayStates.find(
          (state) => state.value === 'top',
        ) as QuestionsDisplayState,
      )
    }
  }, [location, urlHasTopicsParamKey, topicQueried])
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
          showViewAllQuestionsButton ?? questionsDisplayState.value === 'top'
        }
        listAnswerable={listAnswerable}
      />
    </Box>
  )
}
