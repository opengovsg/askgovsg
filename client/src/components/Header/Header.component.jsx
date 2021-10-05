import {
  Button,
  Flex,
  Image,
  Link,
  Stack,
  Spacer,
  Text,
} from '@chakra-ui/react'
import { BiLinkExternal } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { matchPath, useLocation, Link as RouterLink } from 'react-router-dom'
import { ReactComponent as Logo } from '../../assets/logo-white-alpha.svg'
import { useAuth } from '../../contexts/AuthContext'
import { TagType } from '~shared/types/base'
import {
  getPostById,
  GET_POST_BY_ID_QUERY_KEY,
} from '../../services/PostService'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
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
  const { data: post } = postId
    ? useQuery([GET_POST_BY_ID_QUERY_KEY, postId], () => getPostById(postId, 3))
    : {
        data: undefined,
      }

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
    { enabled: !!agencyShortName },
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

  return (
    <Flex
      background="primary.500"
      display="flex"
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
                {agency.longname}
              </Text>
            </>
          ) : null}
        </Stack>
      </Link>
      <Spacer />
      {agency?.website && websiteLinks()}
      {user && authLinks}
    </Flex>
  )
}

export default Header
