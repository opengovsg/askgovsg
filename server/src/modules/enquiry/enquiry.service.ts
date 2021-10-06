import { ModelCtor } from 'sequelize/types'
import { Agency } from '../../models'
import { Enquiry } from '../../types/mail-type'
import { MailService } from '../mail/mail.service'

export class EnquiryService {
  private Agency: ModelCtor<Agency>
  private mailService: Public<MailService>
  constructor({
    Agency,
    mailService,
  }: {
    Agency: ModelCtor<Agency>
    mailService: Public<MailService>
  }) {
    this.Agency = Agency
    this.mailService = mailService
  }
  emailEnquiry = async ({
    agencyId,
    enquiry,
  }: {
    agencyId: number[]
    enquiry: Enquiry
  }): Promise<void> => {
    const agencyEmail = await Promise.all(
      agencyId.map(
        async (id) =>
          (
            await this.Agency.findOne({
              attributes: ['email'],
              where: { id },
            })
          )?.email ?? '',
      ),
    )
    const ccEmail = ['enquiries@ask.gov.sg']
    if (agencyEmail.length === 0) {
      agencyEmail.push('enquiries@ask.gov.sg')
      ccEmail.pop()
    }
    const validData = agencyEmail.every((email) => email !== '')
    if (!validData) {
      throw new Error('One or more agency IDs are invalid')
    }
    enquiry.questionTitle = 'AskGov: ' + enquiry.questionTitle
    await this.mailService.sendEnquiry({ agencyEmail, ccEmail, enquiry })
  }
}
