import express from 'express'
import { EnquiryController } from './enquiry.controller'

export const routeEnquiries = ({
  controller,
}: {
  controller: EnquiryController
}): express.Router => {
  const router = express.Router()

  /**
   * @route      POST /api/enquiries/
   * @desc       email an enquiry
   * @access     Public
   */
  router.post('/', controller.postEnquiry)
  return router
}
