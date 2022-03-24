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
  useMultiStyleConfig,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { BiLinkExternal } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { useDetectDevice } from '../../hooks/useDetectDevice'
import { Link as RouterLink, matchPath, useLocation } from 'react-router-dom'
import { TagType } from '~shared/types/base'
import { ReactComponent as Ask } from '../../assets/ask.svg'
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
import Masthead from '../Masthead/Masthead.component'
import { SearchBox } from '../SearchBox/SearchBox.component'
import Spinner from '../Spinner/Spinner.component'

const Header = (): JSX.Element => {
  const styles = useMultiStyleConfig('Header', {})
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
            crossOrigin=""
          />
        </>
      )}
      <LinkButton text={'Log out'} link={'/login'} handleClick={logout} />
    </Flex>
  )

  const WebsiteLink = () => {
    // Extract hostname from URL
    const website = `${agency?.website}`
    const hostname = new URL(website).hostname
    return (
      <Link sx={styles.websiteLink} href={website} isExternal>
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

  const deviceType = useDetectDevice()

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

  const Logo = () => {
    return (
      <Link
        sx={styles.logoBarRouterLink}
        as={RouterLink}
        to={agency ? `/agency/${agency.shortname}` : '/'}
      >
        <HStack>
          <Box sx={styles.logoBarAsk}>
            <Ask />
          </Box>
          <Text sx={styles.logoBarText}>
            {agency?.shortname.toUpperCase() || 'gov'}
          </Text>
        </HStack>
      </Link>
    )
  }

  return (
    <Flex direction="column" sx={styles.root}>
      <Masthead />
      {deviceType === 'mobile' ? (
        <>
          {!matchQuestions ? (
            <Collapse in={headerIsOpen} animateOpacity={false}>
              <Flex justify="space-between" sx={styles.logoBarMobile}>
                <Logo />
                {user && <AuthLinks />}
              </Flex>
            </Collapse>
          ) : null}
          <Box sx={styles.expandedSearchContainer}>
            <SearchBox sx={styles.expandedSearch} agencyId={agency?.id} />
          </Box>
        </>
      ) : (
        <Flex sx={styles.logoBarTabletDesktop}>
          <Logo />
          <SearchBox sx={styles.compactSearch} agencyId={agency?.id} />
          {agency?.website && <WebsiteLink />}
          {user && <AuthLinks />}
        </Flex>
      )}
    </Flex>
  )
}

export default Header
