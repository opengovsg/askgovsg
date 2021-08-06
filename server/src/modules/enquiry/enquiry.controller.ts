import { createLogger } from '../../bootstrap/logging'
import { ControllerHandler } from '../../types/response-handler'
import { Enquiry } from '../../types/mail-type'
import { EnquiryService } from './enquiry.service'

const logger = createLogger(module)

export class EnquiryController {
  private enquiryService: Public<EnquiryService>
  constructor({ enquiryService }: { enquiryService: Public<EnquiryService> }) {
    this.enquiryService = enquiryService
  }
  postEnquiry: ControllerHandler<
    unknown,
    unknown,
    {
      agencyId: Array<string>
      enquiry: Enquiry
    }
  > = async (req, res) => {
    try {
      this.enquiryService.emailEnquiry({
        agencyId: req.body.agencyId,
        enquiry: req.body.enquiry,
      })
      return res.status(201).json({ message: 'Enquiry sent' })
    } catch (error) {
      logger.error({
        message: 'Error while sending enquiry email',
        meta: {
          function: 'sendEnquiry',
        },
        error,
      })
      return res.status(400).json({ message: error.message })
    }
  }
}
