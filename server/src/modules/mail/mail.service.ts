import { createTransport, Transporter } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { renderLoginOtpBody } from './mail.util'

export class MailService {
  private mailFromEmail: string
  private transport: Transporter
  constructor({
    mailOptions,
    mailFromEmail,
  }: {
    mailOptions: SMTPTransport.Options
    mailFromEmail: string
  }) {
    this.transport = createTransport(mailOptions)
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
