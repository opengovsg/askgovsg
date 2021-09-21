import { AgencyService } from './agency.service'
import { Agency } from '~shared/types/base'
import { Message } from '../../types/message-type'
import { AgencyQuery } from '../../types/agency-type'
import { createLogger } from '../../bootstrap/logging'
import { StatusCodes } from 'http-status-codes'
import { ControllerHandler } from '../../types/response-handler'

const logger = createLogger(module)

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
    try {
      const data = await this.agencyService.findOneByName(req.query)
      if (!data) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: 'Agency not found' })
      }
      return res.status(StatusCodes.OK).json(data)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving single agency by name',
        meta: {
          function: 'getSingleAgency',
        },
        error,
      })
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    }
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
    try {
      const data = await this.agencyService.findOneById(agencyId)
      if (!data) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: 'Agency not found' })
      }
      return res.status(StatusCodes.OK).json(data)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving single agency by ID',
        meta: {
          function: 'getSingleAgencyById',
        },
        error,
      })
      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}
