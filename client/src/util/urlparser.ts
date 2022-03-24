import queryString from 'query-string'

export const getTagsQuery = (search: string): string => {
  const query = queryString.parse(search)
  if (query.tags) {
    return Array.isArray(query.tags) ? query.tags.join(',') : query.tags
  }

  // if nothing is valid return empty str; no filter on front-end
  return ''
}

export const getTopicsQuery = (search: string): string => {
  const query = queryString.parse(search)
  if (query.topics) {
    return Array.isArray(query.topics) ? query.topics.join(',') : query.topics
  }

  // if nothing is valid return empty str; no filter on front-end
  return ''
}

export const isSpecified = (search: string, key: string): boolean =>
  key in queryString.parse(search)

export const getRedirectURLTopics = (
  topic: string,
  agencyShortName: string,
): string => {
  return `/agency/${encodeURIComponent(
    agencyShortName,
  )}?topics=${encodeURIComponent(topic)}`
}

export const getRedirectURLAgency = (agencyShortName: string): string => {
  return `/agency/${encodeURIComponent(agencyShortName)}`
}
