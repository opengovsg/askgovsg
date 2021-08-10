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
})
