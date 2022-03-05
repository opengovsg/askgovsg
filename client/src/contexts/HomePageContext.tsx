import { createContext, ReactChild, ReactChildren, useState } from 'react'
import {
  DEFAULT_QUESTIONS_DISPLAY_STATE,
  DEFAULT_QUESTIONS_SORT_ORDER,
  QuestionsDisplayState,
  QuestionsSortOrder,
} from '../components/Questions/questions'

interface HomePageProps {
  children: ReactChild | ReactChild[] | ReactChildren | ReactChildren[]
}

interface HomePageContextType {
  questionsDisplayState: QuestionsDisplayState
  setQuestionsDisplayState: (state: QuestionsDisplayState) => void
  topicQueried: string
  setTopicQueried: (state: string) => void
  questionsSortOrder: QuestionsSortOrder
  setQuestionsSortOrder: (state: QuestionsSortOrder) => void
  urlHasTopicsParamKey: boolean
  setUrlHasTopicsParamKey: (state: boolean) => void
}

export const HomePageContext = createContext({} as HomePageContextType)

export const HomePageProvider = ({ children }: HomePageProps) => {
  const [questionsDisplayState, setQuestionsDisplayState] = useState(
    DEFAULT_QUESTIONS_DISPLAY_STATE,
  )
  const [questionsSortOrder, setQuestionsSortOrder] = useState(
    DEFAULT_QUESTIONS_SORT_ORDER,
  )
  const [topicQueried, setTopicQueried] = useState('')
  const [urlHasTopicsParamKey, setUrlHasTopicsParamKey] = useState(false)

  return (
    <HomePageContext.Provider
      value={{
        questionsDisplayState,
        setQuestionsDisplayState,
        topicQueried,
        setTopicQueried,
        questionsSortOrder,
        setQuestionsSortOrder,
        urlHasTopicsParamKey,
        setUrlHasTopicsParamKey,
      }}
    >
      {children}
    </HomePageContext.Provider>
  )
}
