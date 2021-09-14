import { ApiClient } from '../api'

export type Enquiry = {
  questionTitle: string
  description: string
  senderEmail: string
}

export type Mail = {
  agencyId: number[]
  enquiry: Enquiry
  captchaResponse: string
}

export const postMail = (mail: Mail): Promise<void> => {
  return ApiClient.post(`/enquiries/`, mail).then(({ data }) => data)
}
