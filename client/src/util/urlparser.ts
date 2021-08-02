import { TagType } from '../types/tag-type'
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

export const getRedirectURL = (
  tagType: string,
  tagName: string,
  agency?: Agency,
): string => {
  if (tagType === TagType.Agency) {
    return `/agency/${tagName}`
  }
  return agency
    ? `/agency/${agency.shortname}?tags=${tagName}`
    : `/?tags=${tagName}`
}
