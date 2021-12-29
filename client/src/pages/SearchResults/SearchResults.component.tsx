import { Box, Flex, HStack, Spacer, VStack } from '@chakra-ui/react'
import { useQuery } from 'react-query'
import { useLocation } from 'react-router-dom'
import OptionsSideMenu from '../../components/OptionsMenu/OptionsSideMenu.component'
import { BackToHome } from '../../components/BackToHome/BackToHome'
import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import PageTitle from '../../components/PageTitle/PageTitle.component'
import PostItem from '../../components/PostItem/PostItem.component'
import Spinner from '../../components/Spinner/Spinner.component'
import AgencyLogo from '../../components/AgencyLogo/AgencyLogo.component'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import {
  search as sendSearchRequest,
  SEARCH_QUERY_KEY,
} from '../../services/SearchService'
import { useEffect, useState } from 'react'

const SearchResults = (): JSX.Element => {
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const searchQuery = searchParams.get('search') ?? ''
  const agencyShortName = searchParams.get('agency')
  const { data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: `${agencyShortName}` }),
    { enabled: !!agencyShortName },
  )

  const { data: foundPosts, isLoading } = useQuery(
    [SEARCH_QUERY_KEY, agency?.id, searchQuery],
    () => sendSearchRequest({ query: searchQuery, agencyId: agency?.id }),
  )

  const device = {
    mobile: 'mobile',
    tablet: 'tablet',
    desktop: 'desktop',
  }

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
  return isLoading ? (
    <Spinner centerHeight="200px" />
  ) : (
    <>
      <HStack
        id="main"
        alignItems="flex-start"
        display="grid"
        gridTemplateColumns={{
          base: '1fr',
          xl: agency ? '1fr 2fr 1fr' : '1fr',
        }}
      >
        {searchQuery ? (
          <PageTitle title={`Search Results for ${searchQuery} - AskGov`} />
        ) : (
          ''
        )}
        {deviceType === device.desktop && (
          <>
            <Box ml="46px" position="absolute">
              {agency && <AgencyLogo agency={agency} />}
            </Box>
            <OptionsSideMenu agency={agency} />
          </>
        )}
        <VStack id="search-results">
          <Box
            px={{ base: '32px', md: '48px' }}
            mx="auto"
            maxW="calc(793px + 48px * 2)"
            className="questions-page"
          >
            <Flex
              mt={{ base: '32px', sm: '60px' }}
              mb={{ base: '32px', sm: '50px' }}
            >
              <BackToHome mainPageName={agencyShortName} />
            </Flex>
            <Flex className="questions-grid">
              <Box
                as="h3"
                textStyle="display-2"
                mb="24px"
                flex="1 auto"
                className="questions-headline"
              >
                {searchQuery ? 'Search Results' : 'All Questions'}
              </Box>
            </Flex>
            <Box
              padding="0"
              w={{ base: '100%', md: undefined }}
              className="questions"
            >
              {foundPosts && foundPosts.length > 0 ? (
                foundPosts.map((entry) => (
                  <PostItem
                    key={entry.postId}
                    post={{
                      id: entry.postId,
                      title: entry.title ?? '',
                      tags: [],
                      agencyId: entry.agencyId ?? 0,
                    }}
                  />
                ))
              ) : (
                <>
                  <Box
                    textStyle="subhead-1"
                    color="gray.800"
                    className="no-results"
                  >
                    {`No results found for "${searchQuery}".`}
                  </Box>
                  <Box>
                    {`Try rephrasing your question, or check your spelling.`}
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </VStack>
      </HStack>

      <Spacer minH={20} />
      <CitizenRequest agency={agency} />
    </>
  )
}

export default SearchResults
