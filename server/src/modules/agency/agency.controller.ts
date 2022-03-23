import { AgencyService } from './agency.service'
import { Agency } from '~shared/types/base'
import { Message } from '../../types/message-type'
import { AgencyQuery } from '../../types/agency-type'
import { StatusCodes } from 'http-status-codes'
import { ControllerHandler } from '../../types/response-handler'
export class AgencyController {
  private agencyService: Public<AgencyService>

  constructor({ agencyService }: { agencyService: Public<AgencyService> }) {
    this.agencyService = agencyService
  }

  /**
   * list all agencies, or agency by shortname or longname
   * @param query agency's shortname or longname
   * @return 200 with agency
   * @return 404 if agency is not found
   * @return 500 if database error
   */

  listAgencies: ControllerHandler<
    undefined,
    Agency[] | Agency | Message,
    undefined,
    AgencyQuery
  > = async (req, res) => {
    const { longname, shortname } = req.query

    const result =
      longname || shortname
        ? this.agencyService.findOneByName(req.query)
        : this.agencyService.listAllAgencies()
    return result
      .map((data) => res.status(StatusCodes.OK).json(data))
      .mapErr((error) => {
        return res.status(error.statusCode).json({ message: error.message })
      })
  }

  /**
   * Find an agency by their id
   * @param agencyId Agency's id
   * @return 200 with agency
   * @return 404 if agency is not found
   * @return 500 if database error
   */
  getSingleAgencyById: ControllerHandler<
    { agencyId: number },
    Agency | Message
  > = async (req, res) => {
    const { agencyId } = req.params
    return this.agencyService
      .findOneById(agencyId)
      .map((data) => res.status(StatusCodes.OK).json(data))
      .mapErr((error) => {
        return res.status(error.statusCode).json({ message: error.message })
      })
  }

  /**
   * List all agency shortnames
   * @return 200 with agency
   * @return 500 if database error
   */
  listAgencyShortNames: ControllerHandler<
    undefined,
    { shortname: string }[] | Message
  > = async (req, res) => {
    return this.agencyService
      .listAgencyShortNames()
      .map((data) => res.status(StatusCodes.OK).json(data))
      .mapErr((error) => {
        return res.status(error.statusCode).json({ message: error.message })
      })
  }
}
