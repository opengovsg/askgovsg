import { Box, Flex, Spacer } from '@chakra-ui/react'
import Fuse from 'fuse.js'
import { useQuery } from 'react-query'
import { useLocation } from 'react-router-dom'
import { BackToHome } from '../../components/BackToHome/BackToHome'
import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import PageTitle from '../../components/PageTitle/PageTitle.component'
import PostItem from '../../components/PostItem/PostItem.component'
import Spinner from '../../components/Spinner/Spinner.component'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import {
  listPosts,
  LIST_POSTS_FOR_SEARCH_QUERY_KEY,
} from '../../services/PostService'

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
  const { data, isLoading } = useQuery(
    [LIST_POSTS_FOR_SEARCH_QUERY_KEY, agency?.id],
    () => listPosts(undefined, agency?.id),
  )

  const foundPosts = new Fuse(data?.posts ?? [], {
    keys: ['title', 'description'],
  })
    .search(searchQuery)
    .map((res) => res.item)

  return isLoading ? (
    <Spinner centerHeight="200px" />
  ) : (
    <>
      {searchQuery ? (
        <PageTitle title={`Search Results for ${searchQuery} - AskGov`} />
      ) : (
        ''
      )}
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
          {foundPosts.length > 0 ? (
            foundPosts.map((post) => <PostItem key={post.id} post={post} />)
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
      <Spacer minH={20} />
      <CitizenRequest agency={agency} />
    </>
  )
}

export default SearchResults
