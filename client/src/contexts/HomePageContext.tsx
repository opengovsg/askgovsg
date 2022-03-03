import { createContext, ReactChild, ReactChildren, useState } from 'react'
import {
  DEFAULT_QUESTIONS_DISPLAY_STATE,
  DEFAULT_QUESTIONS_SORT_STATE,
  QuestionsDisplayState,
  QuestionSortState,
} from '../components/Questions/questions'

interface HomePageProps {
  children: ReactChild | ReactChild[] | ReactChildren | ReactChildren[]
}

interface HomePageContextType {
  questionsDisplayState: QuestionsDisplayState
  setQuestionsDisplayState: (state: QuestionsDisplayState) => void
  topicQueryState: string
  setTopicQueryState: (state: string) => void
  sortState: QuestionSortState
  setSortState: (state: QuestionSortState) => void
  hasTopicsKey: boolean
  setHasTopicsKey: (state: boolean) => void
}

export const HomePageContext = createContext({} as HomePageContextType)

export const HomePageProvider = ({ children }: HomePageProps) => {
  const [questionsDisplayState, setQuestionsDisplayState] = useState(
    DEFAULT_QUESTIONS_DISPLAY_STATE,
  )
  const [sortState, setSortState] = useState(DEFAULT_QUESTIONS_SORT_STATE)
  const [topicQueryState, setTopicQueryState] = useState('')
  const [hasTopicsKey, setHasTopicsKey] = useState(false)

  return (
    <HomePageContext.Provider
      value={{
        questionsDisplayState,
        setQuestionsDisplayState,
        topicQueryState,
        setTopicQueryState,
        sortState,
        setSortState,
        hasTopicsKey,
        setHasTopicsKey,
      }}
    >
      {children}
    </HomePageContext.Provider>
  )
}
