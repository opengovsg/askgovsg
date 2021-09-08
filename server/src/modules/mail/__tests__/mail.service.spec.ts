import { MailService } from '../mail.service'

describe('MailService', () => {
  const transport = { sendMail: jest.fn() }
  const mailFromEmail = 'donotreply@mail.ask.gov.sg'

  const mailService = new MailService({ transport, mailFromEmail })

  beforeEach(() => {
    transport.sendMail.mockReset()
  })

  describe('sendLoginOtp', () => {
    it('sends an html-formatted mail with OTP', async () => {
      // Arrange
      const email = 'user@agency.gov.sg'
      const otp = '123456'

      // Act
      await mailService.sendLoginOtp(email, otp)

      // Assert
      expect(transport.sendMail).toHaveBeenCalledWith({
        to: email,
        from: mailFromEmail,
        subject: `One-Time Password for AskGov`,
        html: `Your OTP for AskGov is <b>${otp}</b>.`,
      })
    })
  })

  describe('sendEnquiryEmail', () => {
    it('sends an enquiry email', async () => {
      // Arrange
      const agencyEmail = ['user@agency.gov.sg']
      const ccEmail = ['cc@agency.gov.sg']
      const enquiry = {
        questionTitle: 'My question is on...',
        description: 'The description of my question is...',
        senderEmail: 'sender@email.com',
      }

      // Act
      await mailService.sendEnquiry({ agencyEmail, ccEmail, enquiry })

      // Assert
      expect(transport.sendMail).toHaveBeenCalledWith({
        to: agencyEmail,
        replyTo: enquiry.senderEmail,
        cc: ccEmail,
        bcc: enquiry.senderEmail,
        from: `Enquiry via AskGov <${mailFromEmail}>`,
        subject: enquiry.questionTitle,
        text: enquiry.description,
      })
    })
  })
})
