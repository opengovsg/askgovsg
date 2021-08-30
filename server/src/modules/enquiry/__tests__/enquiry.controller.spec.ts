import { EnquiryController } from '../enquiry.controller'
import express from 'express'
import supertest from 'supertest'
import { okAsync, errAsync } from 'neverthrow'
import bodyParser from 'body-parser'
import { MissingCaptchaError } from '../../../services/recaptcha/recaptcha.errors'
import { StatusCodes } from 'http-status-codes'

describe('EnquiryController', () => {
  const path = '/enquiries'
  const enquiryService = { emailEnquiry: jest.fn() }
  const recaptchaService = { verifyCaptchaResponse: jest.fn() }

  const controller = new EnquiryController({ enquiryService, recaptchaService })

  const app = express()
  app.use(bodyParser.json())
  app.post(path, controller.postEnquiry)
  const request = supertest(app)

  const data = {
    agencyID: ['1234'],
    enquiry: {
      questionTitle: 'questionTitle',
      description: 'description',
      senderEmail: 'sender@email.com',
    },
    captchaResponse: 'mockResponse',
  }

  beforeEach(() => {
    enquiryService.emailEnquiry.mockReset()
    recaptchaService.verifyCaptchaResponse.mockReset()
  })

  describe('postEnquiry', () => {
    it('returns 201 if enquiry was successfully mailed', async () => {
      // Arrange
      recaptchaService.verifyCaptchaResponse.mockReturnValue(okAsync(true))
      enquiryService.emailEnquiry.mockResolvedValue(null)

      // Act
      const response = await request.post(path).send(data)

      // Assert
      expect(response.status).toEqual(StatusCodes.CREATED)
      expect(response.body).toStrictEqual({ message: 'Enquiry sent' })
    })

    it('returns 400 if one or more agency IDs are invalid', async () => {
      // Arrange
      const errorMessage = 'One or more agency IDs are invalid'
      recaptchaService.verifyCaptchaResponse.mockReturnValue(okAsync(true))
      enquiryService.emailEnquiry.mockRejectedValue(new Error(errorMessage))

      // Act
      const response = await request.post(path).send(data)

      // Assert
      expect(response.status).toEqual(StatusCodes.BAD_REQUEST)
      expect(response.body).toStrictEqual({ message: errorMessage })
    })

    it('returns 400 if missing or cannot verify captcha', async () => {
      // Arrange
      recaptchaService.verifyCaptchaResponse.mockReturnValue(
        errAsync(new MissingCaptchaError()),
      )

      // Act
      const response = await request.post(path).send(data)

      // Assert
      expect(response.status).toEqual(StatusCodes.BAD_REQUEST)
      expect(response.body).toStrictEqual({
        message: 'Captcha was missing. Please refresh and submit again.',
      })
    })
  })
})
