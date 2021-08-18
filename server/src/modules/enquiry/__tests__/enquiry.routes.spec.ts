import bodyParser from 'body-parser'
import express from 'express'
import minimatch from 'minimatch'
import { Sequelize } from 'sequelize'
import supertest from 'supertest'
import {
  defineAgency,
  defineTag,
  defineUserAndPermission,
} from '../../../models'
import { RecaptchaService } from '../../../services/recaptcha/recaptcha.service'
import { MailService } from '../../mail/mail.service'
import { EnquiryController } from '../enquiry.controller'
import { routeEnquiries } from '../enquiry.routes'
import { EnquiryService } from '../enquiry.service'

describe('/enquires', () => {
  // Set up mail
  const transport = { sendMail: jest.fn() }
  const mailFromEmail = 'donotreply@mail.ask.gov.sg'
  const mailService = new MailService({ transport, mailFromEmail })

  // Set up sequelize
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    username: 'username',
    logging: false,
  })
  const emailValidator = new minimatch.Minimatch('*')

  const Tag = defineTag(sequelize)
  const { User } = defineUserAndPermission(sequelize, {
    Tag,
    emailValidator,
  })
  const Agency = defineAgency(sequelize, { User })

  // Set up service, controller and route
  const enquiryService = new EnquiryService({ Agency, mailService })
  const axios = { get: jest.fn() }
  const recaptchaService = new RecaptchaService({ axios })
  const enquiryController = new EnquiryController({
    enquiryService,
    recaptchaService,
  })

  const path = '/enquiries'
  const app = express()
  app.use(bodyParser.json())
  app.use(path, routeEnquiries({ controller: enquiryController }))
  const request = supertest(app)

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns 201 if enquiry was successfully mailed', async () => {
    // Arrange
    const mockAgency1 = await Agency.build({
      shortname: '',
      longname: '',
      email: 'agency1@ask.gov.sg',
      logo: 'www.url.com',
    })
    const data = {
      agencyId: ['1'],
      enquiry: {
        questionTitle: 'questionTitle',
        description: 'description',
        senderEmail: 'sender@email.com',
      },
      captchaResponse: 'mockResponse',
    }
    const AgencyModel = jest
      .spyOn(Agency, 'findOne')
      .mockResolvedValueOnce(mockAgency1)
    axios.get.mockResolvedValueOnce({ data: { success: true } })

    // Act
    const response = await request.post(path).send(data)

    // Assert
    expect(response.status).toEqual(201)
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
