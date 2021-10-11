import { TagType } from '~shared/types/base'
import queryString from 'query-string'
import { Agency } from '../services/AgencyService'

export const getTagsQuery = (search: string): string => {
  const query = queryString.parse(search)
  if (query.tags) {
    return Array.isArray(query.tags) ? query.tags.join(',') : query.tags
  }

  // if nothing is valid return empty str; no filter on front-end
  return ''
}

export const isSpecified = (search: string, key: string): boolean =>
  key in queryString.parse(search)

export const getRedirectURL = (
  tagType: string,
  tagName: string,
  agency?: Agency,
): string => {
  if (tagType === TagType.Agency) {
    return `/agency/${encodeURIComponent(tagName)}`
  } else {
    return agency
      ? `/agency/${encodeURIComponent(
          agency.shortname,
        )}?tags=${encodeURIComponent(tagName)}`
      : `/?tags=${encodeURIComponent(tagName)}`
  }
}
