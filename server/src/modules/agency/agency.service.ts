import { Agency } from '../../bootstrap/sequelize'
import { Agency as AgencyType } from '../../models/agencies.model'
import { AgencyQuery } from '../../types/agency-type'

export class AgencyService {
  /**
   * Find an agency by their shortname or longname
   * @param query agency's shortname or longname
   * @returns agency if found, else null
   */
  findOneByShortName = async (
    query: AgencyQuery,
  ): Promise<AgencyType | null> => {
    const agency = await Agency.findOne({
      where: query,
    })
    if (!agency) {
      return null
    } else {
      return agency
    }
  }

  /**
   * Find an agency by their id
   * tried integrating into one function but params can't tell
   * the diff between string or number
   * @param agencyId Agency's id
   * @returns agency if found, else null
   */
  findOneById = async (agencyId: number): Promise<AgencyType | null> => {
    const agency = await Agency.findOne({
      where: { id: agencyId },
    })
    if (!agency) {
      return null
    } else {
      return agency
    }
  }
}
