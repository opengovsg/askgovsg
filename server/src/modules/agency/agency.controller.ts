import { AgencyService } from './agency.service'
import { Agency } from '~shared/types/base'
import { Message } from '../../types/message-type'
import { AgencyQuery } from '../../types/agency-type'
import { StatusCodes } from 'http-status-codes'
import { ControllerHandler } from '../../types/response-handler'
import { MissingAgencyError } from './agency.errors'

export class AgencyController {
  private agencyService: Public<AgencyService>

  constructor({ agencyService }: { agencyService: Public<AgencyService> }) {
    this.agencyService = agencyService
  }

  /**
   * Find an agency by their shortname or longname
   * @param query agency's shortname or longname
   * @return 200 with agency
   * @return 404 if agency is not found
   * @return 500 if database error
   */
  getSingleAgency: ControllerHandler<
    undefined,
    Agency | Message,
    undefined,
    AgencyQuery
  > = async (req, res) => {
    return this.agencyService
      .findOneByName(req.query)
      .map((data) => res.status(StatusCodes.OK).json(data))
      .mapErr((error) => {
        if (error.constructor === MissingAgencyError) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: error.message })
        } else {
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: 'Something went wrong. Please try again.' })
        }
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
        if (error.constructor === MissingAgencyError) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: error.message })
        } else {
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: 'Something went wrong. Please try again.' })
        }
      })
  }
}
