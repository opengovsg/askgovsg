import { Box, Image, Link, Spinner } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

const AgencyLogo = ({ agency }) => {
  return (
    <Box
      width="120px"
      height="120px"
      p="5px"
      position="relative"
      display="flex"
      justify-content="center"
      alignItems="center"
      overflow="hidden"
      borderRadius="10px"
      bg="#fff"
    >
      {agency ? (
        <Link
          width="100%"
          height="100%"
          as={RouterLink}
          to={agency ? `/agency/${agency.shortname}` : '/'}
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
        </Link>
      ) : (
        <Spinner />
      )}
    </Box>
  )
}

export default AgencyLogo
