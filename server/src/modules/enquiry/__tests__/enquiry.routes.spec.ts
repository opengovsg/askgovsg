import bodyParser from 'body-parser'
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { Sequelize } from 'sequelize'
import supertest from 'supertest'
import { ModelDef } from '../../../types/sequelize'
import { Agency } from '~shared/types/base'
import { RecaptchaService } from '../../../services/recaptcha/recaptcha.service'
import {
  createTestDatabase,
  getModelDef,
  ModelName,
} from '../../../util/jest-db'
import { MailService } from '../../mail/mail.service'
import { EnquiryController } from '../enquiry.controller'
import { routeEnquiries } from '../enquiry.routes'
import { EnquiryService } from '../enquiry.service'

describe('/enquiries', () => {
  // Set up mail
  const transport = { sendMail: jest.fn() }
  const mailFromEmail = 'donotreply@mail.ask.gov.sg'
  const mailService = new MailService({ transport, mailFromEmail })

  // Set up sequelize
  let db: Sequelize
  let Agency: ModelDef<Agency>
  let enquiryService: EnquiryService
  let enquiryController: EnquiryController
  let mockAgency1: Agency

  const axios = { get: jest.fn() }
  const googleRecaptchaURL = 'https://recaptcha.net'
  const recaptchaSecretKey = ''

  const recaptchaService = new RecaptchaService({
    axios,
    googleRecaptchaURL,
    recaptchaSecretKey,
  })

  const path = '/enquiries'
  const app = express()
  app.use(bodyParser.json())
  const request = supertest(app)

  beforeAll(async () => {
    db = await createTestDatabase()
    Agency = getModelDef<Agency>(db, ModelName.Agency)
    mockAgency1 = await Agency.create({
      shortname: '1',
      longname: '',
      logo: 'www.url.com',
      email: 'agency1@ask.gov.sg',
      noEnquiriesMessage: null,
      website: null,
      displayOrder: null,
    })
    enquiryService = new EnquiryService({ Agency, mailService })
    enquiryController = new EnquiryController({
      enquiryService,
      recaptchaService,
    })
    app.use(path, routeEnquiries({ controller: enquiryController }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await db.close()
  })

  it('returns 201 if enquiry was successfully mailed', async () => {
    // Arrange
    const data = {
      agencyId: [mockAgency1.id],
      enquiry: {
        questionTitle: 'questionTitle',
        description: 'description',
        senderEmail: 'sender@email.com',
      },
      captchaResponse: 'mockResponse',
    }
    const AgencyModel = jest.spyOn(Agency, 'findOne')
    axios.get.mockResolvedValueOnce({ data: { success: true } })

    // Act
    const response = await request.post(path).send(data)

    // Assert
    expect(response.status).toEqual(StatusCodes.CREATED)
    expect(response.body).toStrictEqual({ message: 'Enquiry sent' })
    expect(AgencyModel).toBeCalledTimes(1)
    expect(transport.sendMail).toHaveBeenCalledWith({
      to: [mockAgency1.email],
      replyTo: data.enquiry.senderEmail,
      cc: ['enquiries@ask.gov.sg'],
      bcc: data.enquiry.senderEmail,
      from: `Enquiry via AskGov <${mailFromEmail}>`,
      subject: `AskGov: ${data.enquiry.questionTitle}`,
      text: data.enquiry.description,
    })
  })
})
