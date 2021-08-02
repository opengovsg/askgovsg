import convict, { Schema } from 'convict'
import { url, email } from 'convict-format-with-validator'

convict.addFormat(url)
convict.addFormat(email)

export type MailConfig = {
  smtpConfig: {
    host: string
    port: number
    auth: {
      user: string
      pass: string
    }
  }
  senderConfig: {
    mailFrom: string
  }
}

const mailSchema: Schema<MailConfig> = {
  smtpConfig: {
    host: {
      doc: 'SMTP hostname',
      format: 'url',
      default: null,
      env: 'MAIL_HOST',
      sensitive: true,
    },
    port: {
      doc: 'Host URL for SMTP connection',
      format: 'port',
      default: null,
      env: 'MAIL_PORT',
    },
    auth: {
      user: {
        doc: 'Username for SMTP connection',
        format: String,
        default: null,
        env: 'MAIL_AUTH_USER',
        sensitive: true,
      },
      pass: {
        doc: 'Password for SMTP connection',
        format: String,
        default: null,
        env: 'MAIL_AUTH_PASS',
        sensitive: true,
      },
    },
  },
  senderConfig: {
    mailFrom: {
      doc: 'Sender email address',
      format: 'email',
      default: null,
      env: 'MAIL_FROM',
    },
  },
}

export const mailConfig = convict(mailSchema)
  .validate({ allowed: 'strict' })
  .getProperties()
