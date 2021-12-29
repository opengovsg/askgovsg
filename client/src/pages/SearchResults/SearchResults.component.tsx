import { Box, Flex, HStack, Spacer, VStack } from '@chakra-ui/react'
import { useMultiStyleConfig } from '@chakra-ui/system'
import { useQuery } from 'react-query'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import OptionsSideMenu from '../../components/OptionsMenu/OptionsSideMenu.component'
import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import PageTitle from '../../components/PageTitle/PageTitle.component'
import PostItem from '../../components/PostItem/PostItem.component'
import Spinner from '../../components/Spinner/Spinner.component'
import AgencyLogo from '../../components/AgencyLogo/AgencyLogo.component'
import { NavBreadcrumb } from '../../components/NavBreadcrumb/NavBreadcrumb'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import {
  search as sendSearchRequest,
  SEARCH_QUERY_KEY,
} from '../../services/SearchService'

const SearchResults = (): JSX.Element => {
  const styles = useMultiStyleConfig('SearchResults', {})
  const MAX_CHAR = 120
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
  const breadcrumbContentRef = useRef<{ text: string; link: string }[]>([])

  useEffect(() => {
    const searchResult = agency
      ? {
          text: 'Search Results',
          link: `/questions?search=${searchQuery}&agency=${agency.shortname}`,
        }
      : {
          text: 'Search Results',
          link: `/questions?search=${searchQuery}`,
        }

    const questionsList = agency
      ? {
          text: agency.shortname.toUpperCase(),
          link: `/agency/${agency.shortname}`,
        }
      : { text: 'All Agencies', link: `/` }

    breadcrumbContentRef.current = []
    breadcrumbContentRef.current.push(questionsList)
    breadcrumbContentRef.current.push(searchResult)
  })

  return isLoading ? (
    <Spinner centerHeight={`${styles.spinner.height}`} />
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
          <Box sx={styles.questionsPage} className="questions-page">
            <Flex sx={styles.breadcrumb}>
              {breadcrumbContentRef.current.length > 0 ? (
                <NavBreadcrumb navOrder={breadcrumbContentRef.current} />
              ) : null}
            </Flex>
            <Flex sx={styles.questionsGrid} className="questions-grid">
              <Box sx={styles.questionsHeadline} className="questions-headline">
                {foundPosts && foundPosts.length > 0
                  ? foundPosts.length === 1
                    ? `${foundPosts?.length} result found for`
                    : `${foundPosts?.length} results found for`
                  : 'No results found for'}
              </Box>
              <Box sx={styles.searchQuery}>"{searchQuery}"</Box>
            </Flex>
            <Box sx={styles.questionsHeadline} className="questions-headline">
              {foundPosts && foundPosts.length > 0 ? 'QUESTIONS' : null}
            </Box>
            <Box sx={styles.questions} className="questions">
              {foundPosts && foundPosts.length > 0 ? (
                foundPosts.map((entry) => (
                  <PostItem
                    key={entry.postId}
                    post={{
                      id: entry.postId,
                      title: entry.title ?? '',
                      tags: [],
                      agencyId: entry.agencyId ?? 0,
                      answer: entry.answers
                        ? entry.answers[0].length > MAX_CHAR
                          ? `${entry.answers[0].substring(0, MAX_CHAR)}...`
                          : entry.answers[0]
                        : '',
                      searchQuery: searchQuery,
                    }}
                  />
                ))
              ) : (
                <>
                  <Box sx={styles.noResults} className="no-results">
                    <Box sx={styles.noResultsCaption}>
                      Your search did not match any questions and answers. Try
                      another search?
                    </Box>
                    <Box>- Check if the spelling is correct</Box>
                    <Box>- Use different keywords</Box>
                    <Box>- Try general keywords</Box>
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
