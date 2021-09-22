import './AgencyLogo.styles.scss'
import { useQuery } from 'react-query'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import { useParams } from 'react-router-dom'

const AgencyLogo = () => {
  const { agency: agencyShortName } = useParams<{ agency: string }>()
  const { data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    { enabled: !!agencyShortName },
  )
  return (
    <>
      <div className="img_wrapper">
        <div className="border">
          {agency && <img src={agency.logo} alt="Agency Logo" />}
        </div>
      </div>
    </>
  )
}

export default AgencyLogo
