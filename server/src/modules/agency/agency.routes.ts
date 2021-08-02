import express from 'express'
import { AgencyController } from './agency.controller'
import { query } from 'express-validator'

export const routeAgencies = ({
  controller,
}: {
  controller: AgencyController
}): express.Router => {
  const router = express.Router()

  /** @route      GET /api/agencies?<params>
   *  @desc       fetch specific agency
   *  @access     Public
   */
  router.get(
    '/',
    [query('shortname').optional(), query('longname').optional()],
    controller.getSingleAgency,
  )

  /** @route      GET /api/agencies/:agencyId
   *  @desc       fetch specific agency by ID
   *  @access     Public
   */
  router.get('/:agencyId', controller.getSingleAgencyById)
  return router
}
