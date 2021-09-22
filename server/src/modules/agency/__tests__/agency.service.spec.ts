import { AgencyService } from '../agency.service'
import { createTestDatabase, getModel, ModelName } from '../../../util/jest-db'
import { Sequelize, Model } from 'sequelize'
import { Agency } from '~shared/types/base'
import { ModelDef } from '../../../types/sequelize'

describe('AgencyService', () => {
  let agency: Agency

  let db: Sequelize
  let Agency: ModelDef<Agency>
  let service: AgencyService
  beforeAll(async () => {
    db = await createTestDatabase()
    Agency = getModel<Agency & Model>(db, ModelName.Agency)
    agency = await Agency.create({
      shortname: 'was',
      longname: 'Work Allocation Singapore',
      email: 'enquiries@was.gov.sg',
      logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
    })
    service = new AgencyService({ Agency })
  })

  afterAll(async () => {
    await db.close()
  })

  const expectAgencyMatch = (actualAgency: Agency | null, agency: Agency) => {
    expect(actualAgency?.id).toEqual(agency.id)
    expect(actualAgency?.shortname).toEqual(agency.shortname)
    expect(actualAgency?.longname).toEqual(agency.longname)
    expect(actualAgency?.email).toEqual(agency.email)
    expect(actualAgency?.logo).toEqual(agency.logo)
  }

  describe('findOneByName', () => {
    it('returns agency on existing shortname', async () => {
      const { shortname } = agency
      const actualAgency = await service.findOneByName({ shortname })
      expectAgencyMatch(actualAgency, agency)
    })
    it('returns agency on existing longname', async () => {
      const { longname } = agency
      const actualAgency = await service.findOneByName({ longname })
      expectAgencyMatch(actualAgency, agency)
    })
    it('returns null on non-existing shortname', async () => {
      const shortname = 'non-existing'
      const actualAgency = await service.findOneByName({ shortname })
      expect(actualAgency).toBeNull()
    })
  })

  describe('findOneById', () => {
    it('returns agency on existing id', async () => {
      const { id } = agency
      const actualAgency = await service.findOneById(id)
      expectAgencyMatch(actualAgency, agency)
    })
    it('returns null on non-existing shortname', async () => {
      const id = agency.id + 20
      const actualAgency = await service.findOneById(id)
      expect(actualAgency).toBeNull()
    })
  })
})
