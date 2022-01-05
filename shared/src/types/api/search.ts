export type HighlightSearchEntry = {
  title?: string[]
  description?: string[]
  answers?: string[]
}

export type SearchEntry = {
  postId: number
  title?: string
  description?: string | null
  answers?: string[]
  agencyId?: number
  topicId?: number | null
}

export type SearchEntryWithHighlight = {
  result: SearchEntry
  highlight?: HighlightSearchEntry
}
