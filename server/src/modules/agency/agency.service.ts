import { ModelDef } from '../../types/sequelize'
import { Agency } from '~shared/types/base'
import { AgencyQuery } from '../../types/agency-type'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'
import { createLogger } from '../../bootstrap/logging'
import { MissingAgencyError } from './agency.errors'
import { DatabaseError } from '../core/core.errors'

const logger = createLogger(module)
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
   * @returns ok(agency) if retrieval is successful
   * @returns err(DatabaseError) if database errors occurs whilst retrieving agency
   * @returns err(MissingAgencyError) if agency does not exist in the database
   */
  findOneById = (
    agencyId: number,
  ): ResultAsync<Agency, DatabaseError | MissingAgencyError> => {
    return ResultAsync.fromPromise(
      this.Agency.findOne({
        where: { id: agencyId },
      }),
      (error) => {
        logger.error({
          message: 'Database find agency error',
          meta: {
            function: 'findOneById',
            agencyId,
          },
          error,
        })
        return new DatabaseError()
      },
    ).andThen((agency) => {
      if (!agency) {
        return errAsync(new MissingAgencyError())
      }
      return okAsync(agency)
    })
  }
}
