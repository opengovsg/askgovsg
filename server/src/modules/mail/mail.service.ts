import { Transporter } from 'nodemailer'
import { renderLoginOtpBody } from './mail.util'

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
}
