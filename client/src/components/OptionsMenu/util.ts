import { Topic } from '~shared/types/base'

import { GetTopicsDto } from '../../api'
import { Agency } from '../../services/AgencyService'

type bySpecifiedOrderComparator =
  | ((a: GetTopicsDto, b: GetTopicsDto) => number)
  | undefined

export const bySpecifiedOrder = (
  agency?: Agency,
): bySpecifiedOrderComparator => {
  return agency && Array.isArray(agency.displayOrder)
    ? (a: Topic, b: Topic) => {
        const aDisplayOrder = (agency.displayOrder || []).indexOf(a.id)
        const bDisplayOrder = (agency.displayOrder || []).indexOf(b.id)
        if (aDisplayOrder !== -1 && bDisplayOrder !== -1) {
          return aDisplayOrder > bDisplayOrder ? 1 : -1
        } else if (aDisplayOrder !== -1) {
          // a has an enforced display order, so a should be further up
          return -1
        } else if (bDisplayOrder !== -1) {
          // b has an enforced display order, so a should be further down
          return 1
        } else {
          return a.name > b.name ? 1 : -1
        }
      }
    : (a: Topic, b: Topic) => (a.name > b.name ? 1 : -1)
}
