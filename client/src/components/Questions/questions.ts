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
]

export interface QuestionSortState {
  value: string
  label: string
}

export const DEFAULT_QUESTIONS_SORT_STATE: QuestionSortState = {
  value: 'top',
  label: 'Popular',
}

export const questionSortStates: QuestionSortState[] = [
  DEFAULT_QUESTIONS_SORT_STATE,
  { value: 'basic', label: 'Most recent' },
]
