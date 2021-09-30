import { Image, Box } from '@chakra-ui/react'
import { useQuery } from 'react-query'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import { useParams } from 'react-router-dom'

const AgencyLogo = () => {
  const { agency: agencyShortName } = useParams()
  const { data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    { enabled: !!agencyShortName },
  )
  return (
    <Box
      width="120px"
      height="120px"
      p="5px"
      mt="56px"
      position="relative"
      display="flex"
      justify-content="center"
      alignItems="center"
      overflow="hidden"
      borderRadius="10px"
      bg="#fff"
    >
      <Box
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        overflow="hidden"
        border="1px solid #DADCE3"
        borderRadius="10px"
      >
        {agency && (
          <Image
            src={agency.logo}
            alt="Agency Logo"
            loading="lazy"
            display="inline"
            htmlWidth="120px"
            htmlHeight="120px"
            maxW="100%"
            maxH="100%"
            width="auto"
            height="auto"
          />
        )}
      </Box>
    </Box>
  )
}

export default AgencyLogo
