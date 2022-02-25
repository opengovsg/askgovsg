import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Image,
  LayoutProps,
  Link,
  SpaceProps,
  Spinner,
} from '@chakra-ui/react'

import { Agency } from '~shared/types/base'

const AgencyLogo = ({
  agency,
  ...props
}: Pick<LayoutProps, 'display'> &
  SpaceProps & { agency?: Agency }): JSX.Element => {
  return (
    <Box
      {...props}
      width="120px"
      height="120px"
      p="5px"
      justifyContent="center"
      alignItems="center"
      overflow="hidden"
      borderRadius="10px"
      bg="white"
    >
      {agency ? (
        <Link
          width="100%"
          height="100%"
          as={RouterLink}
          to={`/agency/${agency.shortname}`}
        >
          <Box
            width="100%"
            height="100%"
            display="flex"
            alignItems="center"
            overflow="hidden"
            border="1px solid"
            borderColor="secondary.200"
            borderRadius="10px"
          >
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
          </Box>
        </Link>
      ) : (
        <Spinner />
      )}
    </Box>
  )
}

export default AgencyLogo
