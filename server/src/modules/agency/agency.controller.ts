import { AgencyService } from './agency.service'
import { RequestHandler } from 'express'
import { Agency } from '../../models/agencies.model'
import { Message } from '../../types/error-message-type'
import { AgencyQuery } from '../../types/agency-type'
import { createLogger } from '../../bootstrap/logging'

const logger = createLogger(module)

export class AgencyController {
  private agencyService: Public<AgencyService>

  constructor({ agencyService }: { agencyService: Public<AgencyService> }) {
    this.agencyService = agencyService
  }

  getSingleAgency: RequestHandler<
    unknown,
    Agency | Message,
    unknown,
    AgencyQuery
  > = async (req, res) => {
    try {
      const data = await this.agencyService.findOneByShortName(req.query)
      if (!data) {
        return res.status(404).json({ message: 'Agency not found' })
      }
      return res.status(200).json(data)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving single agency by name',
        meta: {
          function: 'getSingleAgency',
        },
        error,
      })
      return res.sendStatus(500)
    }
  }

  // ID method

  getSingleAgencyById: RequestHandler<{ agencyId: number }, Agency | Message> =
    async (req, res) => {
      const { agencyId } = req.params
      try {
        const data = await this.agencyService.findOneById(agencyId)
        if (!data) {
          return res.status(404).json({ message: 'Agency not found' })
        }
        return res.status(200).json(data)
      } catch (error) {
        logger.error({
          message: 'Error while retrieving single agency by ID',
          meta: {
            function: 'getSingleAgencyById',
          },
          error,
        })
        return res.sendStatus(500)
      }
    }
}
