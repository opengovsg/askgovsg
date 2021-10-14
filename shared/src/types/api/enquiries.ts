export type Enquiry = {
  questionTitle: string
  description: string
  senderEmail: string
}

export type EnquiryRequest = {
  agencyId: number[]
  enquiry: Enquiry
  captchaResponse: string
}
