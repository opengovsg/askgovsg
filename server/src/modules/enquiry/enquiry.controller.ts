import { createLogger } from '../../bootstrap/logging'
import { ControllerHandler } from '../../types/response-handler'
import { Enquiry } from '../../types/mail-type'
import { EnquiryService } from './enquiry.service'
import { Message } from '../../types/message-type'
import { verifyCaptchaResponse } from '../../services/captcha/captcha.service'
import { mapRouteError } from '../../services/captcha/captcha.util'

const logger = createLogger(module)
export class EnquiryController {
  private enquiryService: Public<EnquiryService>
  constructor({ enquiryService }: { enquiryService: Public<EnquiryService> }) {
    this.enquiryService = enquiryService
  }

  /**
   * Emails enquiry to agencies
   * @returns 201 if enquiry was successfully mailed
   * @returns 400 if one or more agency IDs are invalid
   * @returns 400 if missing or cannot verify captcha
   * @returns 400 if error while sending mail
   * @returns 500 if unable to match captcha error
   */
  postEnquiry: ControllerHandler<
    unknown,
    Message,
    {
      agencyId: Array<string>
      enquiry: Enquiry
      captchaResponse: string
    }
  > = async (req, res) => {
    // Check Captcha
    const captchaResult = await verifyCaptchaResponse(req.body.captchaResponse)

    if (captchaResult.isErr()) {
      logger.error({
        message: 'Error while verifying captcha',
        meta: {
          function: 'postEnquiry',
        },
        error: captchaResult.error,
      })
      const { errorMessage, statusCode } = mapRouteError(captchaResult.error)
      return res.status(statusCode).json({ message: errorMessage })
    }

    // Send enquiry
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
