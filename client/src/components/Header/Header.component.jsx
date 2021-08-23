import {
  Box,
  Divider,
  Flex,
  HStack,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useQuery } from 'react-query'
import { Link, matchPath, useLocation } from 'react-router-dom'
import { ReactComponent as Logo } from '../../assets/LogoAlpha.svg'
import { useAuth } from '../../contexts/AuthContext'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import LinkButton from '../LinkButton/LinkButton.component'
import Spinner from '../Spinner/Spinner.component'
import TagPanelMobile from '../TagPanel/TagPanelMobile.component'

const Header = () => {
  const { user, logout } = useAuth()

  const location = useLocation()
  const match = matchPath(location.pathname, {
    path: '/agency/:agency',
  })
  const isHomePage =
    matchPath(location.pathname, {
      path: '/',
      exact: true,
    }) !== null ||
    matchPath(location.pathname, {
      path: '/agency/:agency',
      exact: true,
    }) !== null
  const agencyShortName = match?.params?.agency
  const { isLoading, data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    { enabled: !!agencyShortName },
  )

  const authLinks = (
    <Flex align="center">
      {isLoading || user === null ? (
        <Spinner width="50px" height="50px" />
      ) : (
        <>
          <Text textStyle="body-2" mr={2} color="white">
            {user.displayname}
          </Text>
          <Image
            alt="user-logo"
            boxSize={8}
            borderRadius="3px"
            mr={4}
            src={`https://secure.gravatar.com/avatar/${user.id}?s=164&d=identicon`}
          />
        </>
      )}
      <LinkButton text={'Log out'} link={'/login'} handleClick={logout} />
    </Flex>
  )

  return (
    <Flex
      background="primary.500"
      display="flex"
      justify="space-between"
      align="center"
      px="32px"
      py="15px"
      height={{ base: '122px', md: '74px' }}
    >
      <Stack
        direction={{ base: 'column', md: 'row' }}
        textDecor="none"
        align={{ base: 'flex-start', md: 'center' }}
        position="relative"
        top="8px"
      >
        {/* Show tag panel mobile only on mobile and homepage*/}
        {isHomePage && (
          <Box d={{ base: 'block', xl: 'none' }}>
            <TagPanelMobile />
          </Box>
        )}
        <Link to={agency ? `/agency/${agency.shortname}` : '/'}>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'flex-start', md: 'center' }}
          >
            <Box pr="15px" mb={{ base: '0px', md: '6px' }}>
              <Logo />
            </Box>
            {agency ? (
              <>
                <Text
                  d={{ base: 'none', md: 'block' }}
                  pr={{ base: 0, md: 5 }}
                  textStyle="h4"
                  fontWeight={300}
                  color="white"
                >
                  |
                </Text>
                <Text
                  position={{ base: 'relative', md: 'static' }}
                  top={{ base: '-6px', md: 0 }}
                  textStyle="h4"
                  fontWeight={400}
                  color="white"
                >
                  {agency.longname}
                </Text>
              </>
            ) : null}
          </Stack>
        </Link>
      </Stack>
      {user && authLinks}
    </Flex>
  )
}

export default Header
