import { AxiosResponse } from 'axios'

import { EnquiryRequest, ErrorDto as ResponseDto } from '~shared/types/api'

import { ApiClient } from '../api'

export const postMail = (request: EnquiryRequest): Promise<ResponseDto> => {
  return ApiClient.post<EnquiryRequest, AxiosResponse<ResponseDto>>(
    `/enquiries/`,
    request,
  ).then(({ data }) => data)
}
