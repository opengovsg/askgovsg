import { ApiClient } from '../api'

export type Enquiry = {
  questionTitle: string
  description: string
  senderEmail: string
}

export type Mail = {
  // TODO change string to number. Currently aligned with AgencyService
  agencyId: Array<string>
  enquiry: Enquiry
}

export const postMail = (mail: Mail): Promise<void> => {
  return ApiClient.post(`/enquiries/`, mail).then(({ data }) => data)
}
