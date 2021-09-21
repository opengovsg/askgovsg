import { ModelDef } from '../../types/sequelize'
import { Agency } from '~shared/types/base'
import { AgencyQuery } from '../../types/agency-type'
export class AgencyService {
  private Agency: ModelDef<Agency>

  constructor({ Agency }: { Agency: ModelDef<Agency> }) {
    this.Agency = Agency
  }

  /**
   * Find an agency by their shortname or longname
   * @param query agency's shortname or longname
   * @returns agency if found, else null
   */
  findOneByName = async (query: AgencyQuery): Promise<Agency | null> => {
    const agency = await this.Agency.findOne({
      where: query,
    })
    return agency ?? null
  }

  /**
   * Find an agency by their id
   * tried integrating into one function but params can't tell
   * the diff between string or number
   * @param agencyId Agency's id
   * @returns agency if found, else null
   */
  findOneById = async (agencyId: number): Promise<Agency | null> => {
    const agency = await this.Agency.findOne({
      where: { id: agencyId },
    })
    return agency ?? null
  }
}
