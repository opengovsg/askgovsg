import express from 'express'
import { AgencyController } from './agency.controller'
import { query } from 'express-validator'

export const routeAgencies = ({
  controller,
}: {
  controller: AgencyController
}): express.Router => {
  const router = express.Router()

  /**
   * Find an agency by their shortname or longname
   * @route  GET /api/agencies?<params>
   * @return 200 with agency
   * @return 404 if agency is not found
   * @return 500 if database error
   * @access Public
   */
  router.get(
    '/',
    [query('shortname').optional(), query('longname').optional()],
    controller.getSingleAgency,
  )

  /**
   * Find an agency by their id
   * @route  GET /api/agencies/:agencyId
   * @return 200 with agency
   * @return 404 if agency is not found
   * @return 500 if database error
   * @access Public
   */
  router.get('/:agencyId', controller.getSingleAgencyById)
  return router
}
