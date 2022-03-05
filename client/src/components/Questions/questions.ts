export interface QuestionsDisplayState {
  value: string
  label: string
  questionsPerPage: number
}

export const DEFAULT_QUESTIONS_DISPLAY_STATE: QuestionsDisplayState = {
  value: 'top',
  label: 'TOP QUESTIONS',
  questionsPerPage: 10,
}

export const questionsDisplayStates: QuestionsDisplayState[] = [
  DEFAULT_QUESTIONS_DISPLAY_STATE,
  {
    value: 'all',
    label: 'ALL QUESTIONS',
    questionsPerPage: 30,
  },
  {
    value: 'topic',
    label: 'QUESTIONS ON THIS TOPIC',
    questionsPerPage: 30,
  },
]

export interface QuestionsSortOrder {
  value: string
  label: string
}

export const DEFAULT_QUESTIONS_SORT_ORDER: QuestionsSortOrder = {
  value: 'top',
  label: 'Popular',
}

export const questionsSortOrders: QuestionsSortOrder[] = [
  DEFAULT_QUESTIONS_SORT_ORDER,
  { value: 'basic', label: 'Most recent' },
]
