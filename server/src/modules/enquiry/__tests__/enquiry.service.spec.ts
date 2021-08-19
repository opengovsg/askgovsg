import { EnquiryService } from '../enquiry.service'
import { Enquiry } from '../../../types/mail-type'
import { Sequelize } from 'sequelize'
import {
  defineAgency,
  defineTag,
  defineUserAndPermission,
} from '../../../models'
import minimatch from 'minimatch'

describe('EnquiryService', () => {
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

  const mailService = { sendEnquiry: jest.fn(), sendLoginOtp: jest.fn() }
  const enquiryService = new EnquiryService({ Agency, mailService })

  const enquiry: Enquiry = {
    questionTitle: 'My question',
    description: 'My description',
    senderEmail: 'sender@email.com',
  }

  beforeEach(async () => {
    mailService.sendEnquiry.mockReset()
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('sendEnquiry', () => {
    it('should send an enquiry email to two agencies', async () => {
      // Arrange
      const agencyId = ['1234', '2233']
      const mockAgency1 = Agency.build({
        email: 'agency1@ask.gov.sg',
      })
      const mockAgency2 = Agency.build({
        email: 'agency2@ask.gov.sg',
      })
      const AgencyModel = jest
        .spyOn(Agency, 'findOne')
        .mockResolvedValueOnce(mockAgency1)
        .mockResolvedValueOnce(mockAgency2)

      // Act
      await enquiryService.emailEnquiry({ agencyId, enquiry })

      // Assert
      expect(AgencyModel).toBeCalledTimes(2)
      expect(mailService.sendEnquiry).toHaveBeenCalledWith({
        agencyEmail: [mockAgency1.email, mockAgency2.email],
        ccEmail: ['enquiries@ask.gov.sg'],
        enquiry: enquiry,
      })
    })

    it('should send an enquiry email to AskGov if no agency is specified', async () => {
      // Arrange
      const agencyId: string[] = []
      const AgencyModel = jest.spyOn(Agency, 'findOne')

      // Act
      await enquiryService.emailEnquiry({ agencyId, enquiry })

      // Assert
      expect(AgencyModel).toBeCalledTimes(0)
      expect(mailService.sendEnquiry).toHaveBeenCalledWith({
        agencyEmail: ['enquiries@ask.gov.sg'],
        ccEmail: [],
        enquiry: enquiry,
      })
    })

    it('should return error when a agency ID is invalid', async () => {
      // Arrange
      const agencyId = ['1234']
      jest.spyOn(Agency, 'findOne').mockResolvedValueOnce(null)

      try {
        // Act
        await enquiryService.emailEnquiry({ agencyId, enquiry })
        throw new Error('Test was force-failed')
      } catch (error) {
        // Assert
        expect(error.message).toBe('One or more agency IDs are invalid')
      }
    })
  })
})
