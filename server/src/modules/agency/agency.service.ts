import { Agency } from '../../bootstrap/sequelize'
import { Agency as AgencyType } from '../../models/agencies.model'
import { AgencyQuery } from '../../types/agency-type'

export class AgencyService {
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

  // tried integrating into one function but params can't tell
  // the diff between string or number
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
