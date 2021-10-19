import {
  Box,
  Button,
  Fade,
  Flex,
  Image,
  Link,
  Stack,
  Text,
  useDisclosure,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { BiLinkExternal } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { Link as RouterLink, matchPath, useLocation } from 'react-router-dom'
import { TagType } from '~shared/types/base'
import { ReactComponent as Logo } from '../../assets/logo-white-alpha.svg'
import AgencyLogo from '../../components/AgencyLogo/AgencyLogo.component'
import Masthead from '../../components/Masthead/Masthead.component'
import SearchBoxComponent from '../../components/SearchBox/SearchBox.component'
import { useAuth } from '../../contexts/AuthContext'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import {
  getPostById,
  GET_POST_BY_ID_QUERY_KEY,
} from '../../services/PostService'
import LinkButton from '../LinkButton/LinkButton.component'
import Spinner from '../Spinner/Spinner.component'

const Header = () => {
  const { user, logout } = useAuth()

  const location = useLocation()
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const match = matchPath(location.pathname, {
    path: '/agency/:agency',
  })
  const matchPost = matchPath(location.pathname, {
    path: '/questions/:id',
  })
  const postId = matchPost?.params?.id
  const { data: post } = useQuery(
    [GET_POST_BY_ID_QUERY_KEY, postId],
    () => getPostById(postId, 3),
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
    () => getAgencyByShortName({ shortname: agencyShortName }),
    { enabled: Boolean(agencyShortName) },
  )

  const authLinks = (
    <Flex align="center" mx={6}>
      {isLoading || user === null ? (
        <Spinner centerWidth="50px" centerHeight="50px" />
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
            loading="lazy"
          />
        </>
      )}
      <LinkButton
        text={'Log out'}
        link={'/login'}
        type={'s-btn__filled'}
        handleClick={logout}
      />
    </Flex>
  )

  const websiteLinks = () => {
    // Extract hostname from URL
    const hostname = new URL(agency?.website).hostname
    return (
      <Link href={agency?.website} isExternal>
        <Button
          rightIcon={<BiLinkExternal color="white" />}
          variant="link"
          color="white"
        >
          Go to {hostname}
        </Button>
      </Link>
    )
  }

  // look for /questions to catch search result and post pages
  const matchQuestions = matchPath(location.pathname, {
    path: '/questions',
  })
  const {
    isOpen: headerIsOpen,
    onOpen: openHeader,
    onClose: closeHeader,
  } = useDisclosure({ defaultIsOpen: true })

  const checkHeaderState = () => {
    if (window.pageYOffset > 280) closeHeader()
    else openHeader()
  }

  // useSticky is implemented with window.innerWidth instead of useBreakpointValue
  // as useBreakpointValue switches value to true between 345px - 465px for some reason
  const useSticky = window.innerWidth < 1440 ? false : true // 1440px = 90em is the breakpoint for desktop

  useEffect(() => {
    if (!matchQuestions && useSticky) {
      openHeader()
      window.addEventListener('scroll', checkHeaderState)
      return () => window.removeEventListener('scroll', checkHeaderState)
    } else {
      closeHeader()
    }
  }, [matchQuestions, useSticky])

  const expandedSearch = () => {
    return (
      <Box
        bg="primary.500"
        h={
          agency
            ? { base: '120px', md: '176px' }
            : { base: '120px', xl: '176px' }
        }
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
            mt={
              agency
                ? { base: '20px', md: '56px' }
                : { base: '4px', xl: '56px' }
            }
            pt="!52px"
            px={{ base: '24px', md: 'auto' }}
            maxW="680px"
            w="100%"
          >
            <SearchBoxComponent agencyShortName={agency?.shortname} />
          </Flex>
        </Flex>
        {Boolean(agency) ? (
          <Box px="36px" mt="-20px" display={{ base: 'none', lg: 'flex' }}>
            <AgencyLogo agency={agency} />
          </Box>
        ) : null}
      </Box>
    )
  }
  return (
    <Flex
      direction="column"
      sx={{
        position: { base: 'static', xl: '-webkit-sticky' } /* Safari */,
        position: { base: 'static', xl: 'sticky' },
        top: '0',
        'z-index': '999',
      }}
    >
      <Masthead />
      <Flex
        background="primary.500"
        justify="space-between"
        align="center"
        px={8}
        py={4}
        shrink={0}
      >
        <Link as={RouterLink} to={agency ? `/agency/${agency.shortname}` : '/'}>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            textDecor="none"
            align={{ base: 'flex-start', md: 'center' }}
            position="relative"
          >
            <Logo />
            {agency ? (
              <>
                <Text
                  d={{ base: 'none', md: 'block' }}
                  px={{ base: 0, md: 2 }}
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
                  {agency.shortname.toUpperCase()}
                </Text>
              </>
            ) : null}
          </Stack>
        </Link>
        <Flex d={{ base: 'none', sm: 'block' }}>
          {agency?.website && websiteLinks()}
        </Flex>
        {user && authLinks}
      </Flex>
      {(useSticky && !headerIsOpen) || matchQuestions ? (
        <Flex
          h="56px"
          m="auto"
          px={{ base: '24px', md: 'auto' }}
          maxW="680px"
          w="100%"
          mt="-68px"
          d={{ base: 'none', xl: 'block' }}
        >
          <SearchBoxComponent agencyShortName={agency?.shortname} />
        </Flex>
      ) : null}
      {!matchQuestions && useSticky ? (
        <Fade in={headerIsOpen}>{expandedSearch()}</Fade>
      ) : matchQuestions ? null : (
        expandedSearch()
      )}
    </Flex>
  )
}

export default Header
