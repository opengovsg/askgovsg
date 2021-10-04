import { Flex, Spacer } from '@chakra-ui/react'
import Fuse from 'fuse.js'
import { Fragment } from 'react'
import { useQuery } from 'react-query'
import { useLocation } from 'react-router-dom'
import { BackToHome } from '../../components/BackToHome/BackToHome'
import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import PageTitle from '../../components/PageTitle/PageTitle.component'
import PostItem from '../../components/PostItem/PostItem.component'
import SearchBox from '../../components/SearchBox/SearchBox.component'
import Spinner from '../../components/Spinner/Spinner.component'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import {
  listPosts,
  LIST_POSTS_FOR_SEARCH_QUERY_KEY,
} from '../../services/PostService'
import { sortByCreatedAt } from '../../util/date'
import './SearchResults.styles.scss'

const SearchResults = () => {
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const searchQuery = searchParams.get('search') ?? ''
  const agencyShortName = searchParams.get('agency')
  const { data, isLoading } = useQuery(
    [LIST_POSTS_FOR_SEARCH_QUERY_KEY, agencyShortName],
    listPosts(undefined, agencyShortName),
  )
  const { data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    { enabled: !!agencyShortName },
  )

  const foundPosts = new Fuse(data?.posts ?? [], {
    keys: ['title', 'description'],
  })
    .search(searchQuery)
    .map((res) => res.item)
    .sort(sortByCreatedAt)

  return isLoading ? (
    <Spinner centerHeight="200px" />
  ) : (
    <Fragment>
      {searchQuery ? (
        <PageTitle title={`Search Results for ${searchQuery} - AskGov`} />
      ) : (
        ''
      )}
      <div id="mainbar" className="questions-page fc-black-800">
        <Flex
          mt={{ base: '32px', sm: '60px' }}
          mb={{ base: '32px', sm: '50px' }}
        >
          <BackToHome mainPageName={agencyShortName} />
        </Flex>
        <div className="questions-grid">
          <h3 className="questions-headline">
            {searchQuery ? 'Search Results' : 'All Questions'}
          </h3>
        </div>
        {searchQuery ? (
          <div className="search-questions">
            <SearchBox
              agencyShortName={agencyShortName}
              value={searchQuery}
              name={'search'}
              pt={'mt8'}
            />
          </div>
        ) : (
          ''
        )}
        <div className="questions">
          {foundPosts.length > 0 ? (
            foundPosts.map((post) => <PostItem key={post.id} post={post} />)
          ) : (
            <>
              <div className="no-results">
                {`No results found for "${searchQuery}".`}
              </div>
              <div>
                {`Try rephrasing your question, or check your spelling.`}
              </div>
            </>
          )}
        </div>
      </div>
      <Spacer minH={20} />
      <CitizenRequest
        agency={
          agency
            ? agency
            : {
                id: '',
                email: 'enquiries@ask.gov.sg',
                shortname: 'AskGov',
                longname: 'AskGov',
                logo: '',
              }
        }
      />
    </Fragment>
  )
}

export default SearchResults
