import { Transporter } from 'nodemailer'
import { renderLoginOtpBody } from './mail.util'
import { Enquiry } from '../../types/mail-type'
export class MailService {
  private mailFromEmail: string
  private transport: Pick<Transporter, 'sendMail'>
  constructor({
    transport,
    mailFromEmail,
  }: {
    transport: Pick<Transporter, 'sendMail'>
    mailFromEmail: string
  }) {
    this.transport = transport
    this.mailFromEmail = mailFromEmail
  }

  sendLoginOtp = async (email: string, otp: string): Promise<unknown> => {
    return this.transport.sendMail({
      to: email,
      from: this.mailFromEmail,
      subject: `One-Time Password for AskGov`,
      html: renderLoginOtpBody(otp),
    })
  }

  sendEnquiry = async ({
    agencyEmail,
    ccEmail,
    enquiry,
  }: {
    agencyEmail: Array<string>
    ccEmail: Array<string>
    enquiry: Enquiry
  }): Promise<void> => {
    await this.transport.sendMail({
      from: this.mailFromEmail,
      replyTo: enquiry.senderEmail,
      to: agencyEmail,
      cc: ccEmail,
      bcc: enquiry.senderEmail,
      subject: enquiry.questionTitle,
      text: enquiry.description,
    })
  }
}
