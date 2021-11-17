import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  Image,
  Link,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { BiLinkExternal } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { Link as RouterLink, matchPath, useLocation } from 'react-router-dom'
import { TagType } from '~shared/types/base'
import { ReactComponent as Ask } from '../../assets/ask.svg'
import { ReactComponent as Logo } from '../../assets/logo-alpha.svg'
import { useAuth } from '../../contexts/AuthContext'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import {
  getPostById,
  GET_POST_BY_ID_QUERY_KEY,
} from '../../services/PostService'
import AgencyLogo from '../AgencyLogo/AgencyLogo.component'
import LinkButton from '../LinkButton/LinkButton.component'
import Masthead from '../Masthead/Masthead.component'
import { SearchBox } from '../SearchBox/SearchBox.component'
import Spinner from '../Spinner/Spinner.component'

const Header = (): JSX.Element => {
  const { user, logout } = useAuth()

  const location = useLocation()
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const match = matchPath('/agency/:agency', location.pathname)
  const matchPost = matchPath('/questions/:id', location.pathname)
  const postId = matchPost?.params?.id
  const { data: post } = useQuery(
    [GET_POST_BY_ID_QUERY_KEY, postId],
    () => getPostById(Number(postId), 3),
    { enabled: Boolean(postId) },
  )

  // Similar logic to find agency as login component
  // if post is linked to multiple agencies via agencyTag
  // take the first agencyTag found as agency
  const firstAgencyTagLinkedToPost = post?.tags?.find(
    (tag) => tag.tagType === TagType.Agency,
  )
  const agencyShortName =
    match?.params?.agency ||
    searchParams.get('agency') ||
    firstAgencyTagLinkedToPost?.tagname
  const { isLoading, data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: `${agencyShortName}` }),
    { enabled: Boolean(agencyShortName) },
  )

  const AuthLinks = () => (
    <Flex align="center" mx={6}>
      {isLoading || user === null ? (
        <Spinner centerWidth="50px" centerHeight="50px" />
      ) : (
        <>
          <Text textStyle="body-2" mr={2} color="secondary.700">
            {user.displayname}
          </Text>
          <Image
            alt="user-logo"
            boxSize={8}
            borderRadius="3px"
            mr={4}
            src={`https://secure.gravatar.com/avatar/${user.id}?s=164&d=identicon`}
            loading="lazy"
          />
        </>
      )}
      <LinkButton text={'Log out'} link={'/login'} handleClick={logout} />
    </Flex>
  )

  const WebsiteLinks = () => {
    // Extract hostname from URL
    const website = `${agency?.website}`
    const hostname = new URL(website).hostname
    return (
      <Link href={website} isExternal>
        <Button
          rightIcon={<BiLinkExternal color="neutral.900" />}
          variant="link"
          color="neutral.900"
        >
          Go to {hostname}
        </Button>
      </Link>
    )
  }

  // Look for /questions to catch search result and post pages
  const matchQuestions = matchPath('/questions/*', location.pathname)
  const {
    isOpen: headerIsOpen,
    onOpen: openHeader,
    onClose: closeHeader,
  } = useDisclosure({ defaultIsOpen: true })

  const checkHeaderState = () => {
    if (window.pageYOffset > 280) closeHeader()
    else if (window.pageYOffset < 5) openHeader()
  }

  const device = {
    mobile: 'mobile',
    tablet: 'tablet',
    desktop: 'desktop',
  }

  // Responsive styling based on viewport width is implemented with window.innerWidth
  // instead of useBreakpointValue as useBreakpointValue switches value to true between
  // 345px - 465px for some reason.
  // 480 px = 30em if the breakpoint for mobile
  // 1440px = 90em is the breakpoint for desktop
  const [deviceType, setDeviceType] = useState(
    window.innerWidth < 480
      ? device.mobile
      : window.innerWidth < 1440
      ? device.tablet
      : device.desktop,
  )

  const checkViewportSize = () => {
    setDeviceType(
      window.innerWidth < 480
        ? device.mobile
        : window.innerWidth < 1440
        ? device.tablet
        : device.desktop,
    )
  }

  useEffect(() => {
    window.addEventListener('resize', checkViewportSize)
    return () => window.removeEventListener('resize', checkViewportSize)
  }, [])

  // attach to matchQuestions?.path instead of matchQuestions because matchQuestions is
  // an object and will trigger the callback without values within the object changing
  useEffect(() => {
    if (!matchQuestions) {
      openHeader()
      window.addEventListener('scroll', checkHeaderState)
      return () => {
        window.removeEventListener('scroll', checkHeaderState)
      }
    } else {
      closeHeader()
    }
  }, [matchQuestions?.pathname])

  const ExpandedSearch = () => {
    return (
      <Box
        bg="white"
        h={{ base: '100px', xl: '152px' }}
        className="top-background"
      >
        <Flex
          direction="row"
          justifyContent="flex-start"
          className="home-search"
        >
          {/* TODO: might need to do some enforcing to ensure you can only */}
          {/* enter a single agency in the URL */}

          <Flex
            h="56px"
            m="auto"
            mt={{ base: '20px', xl: '64px' }}
            px={{ base: '24px', md: 'auto' }}
            maxW="680px"
            w="100%"
          >
            <SearchBox agencyId={agency?.id} />
          </Flex>
        </Flex>
        {Boolean(agency) ? (
          <Box px="36px" mt="-55px" display={{ base: 'none', xl: 'flex' }}>
            <AgencyLogo agency={agency} />
          </Box>
        ) : null}
      </Box>
    )
  }

  const LogoBar = () => {
    return (
      <Flex
        bg="white"
        justify="space-between"
        align="center"
        px={8}
        py={4}
        shrink={0}
      >
        <Link
          _hover={{
            textDecoration: 'none',
          }}
          as={RouterLink}
          to={agency ? `/agency/${agency.shortname}` : '/'}
        >
          {agency ? (
            <HStack>
              <Box marginRight="-1px">
                <Ask />
              </Box>
              <Text
                // Force margins here to override stubborn and temperatmental
                // Chakra defaults for content within HStack
                marginInlineStart="0 !important"
                marginTop="auto !important"
                marginBottom="1px !important"
                position="relative"
                textStyle="logo"
                color="black"
              >
                {agency.shortname.toUpperCase()}
              </Text>
            </HStack>
          ) : (
            <Logo />
          )}
        </Link>

        <Flex d={{ base: 'none', sm: 'block' }}>
          {agency?.website && <WebsiteLinks />}
        </Flex>
        {user && <AuthLinks />}
      </Flex>
    )
  }

  return (
    <Flex
      direction="column"
      sx={{
        position: 'sticky',
        top: '0',
        'z-index': '999',
      }}
    >
      <Masthead />
      {deviceType === device.desktop ? (
        <LogoBar />
      ) : matchQuestions ? null : (
        <Collapse in={headerIsOpen} animateOpacity={false}>
          <LogoBar />
        </Collapse>
      )}
      {deviceType === device.desktop && !headerIsOpen ? (
        <Flex
          h="56px"
          m="auto"
          px={{ base: '24px', md: 'auto' }}
          maxW="680px"
          w="100%"
          mt="-68px"
          d={{ base: 'none', xl: 'block' }}
        >
          <SearchBox agencyId={agency?.id} />
        </Flex>
      ) : null}
      {!matchQuestions && deviceType === device.desktop ? (
        <Collapse in={headerIsOpen} animateOpacity={false}>
          <ExpandedSearch />
        </Collapse>
      ) : matchQuestions && deviceType === device.desktop ? null : (
        <ExpandedSearch />
      )}
    </Flex>
  )
}

export default Header
