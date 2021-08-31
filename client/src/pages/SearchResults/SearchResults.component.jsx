import Fuse from 'fuse.js'
import { Fragment } from 'react'
import { useQuery } from 'react-query'
import { useLocation } from 'react-router-dom'
import PageTitle from '../../components/PageTitle/PageTitle.component'
import { BackToHome } from '../../components/BackToHome/BackToHome'
import PostItem from '../../components/PostItem/PostItem.component'
import SearchBox from '../../components/SearchBox/SearchBox.component'
import { Spacer } from '@chakra-ui/react'
import Spinner from '../../components/Spinner/Spinner.component'
import { listPosts, LIST_POSTS_QUERY_KEY } from '../../services/PostService'
import './SearchResults.styles.scss'
import { sortByCreatedAt } from '../../util/date'

const SearchResults = () => {
  const { data: data, isLoading } = useQuery([LIST_POSTS_QUERY_KEY], () =>
    listPosts(),
  )

  let searchQuery =
    new URLSearchParams(useLocation().search).get('search') ?? ''

  const foundPosts = new Fuse(data?.posts ?? [], {
    keys: ['title', 'description'],
  })
    .search(searchQuery)
    .map((res) => res.item)
    .sort(sortByCreatedAt)

  return isLoading ? (
    <Spinner type="page" width="75px" height="200px" />
  ) : (
    <Fragment>
      {searchQuery ? (
        <PageTitle title={`Search Results for ${searchQuery} - AskGov`} />
      ) : (
        ''
      )}
      <div id="mainbar" className="questions-page fc-black-800">
        <BackToHome />
        <div className="questions-grid">
          <h3 className="questions-headline">
            {searchQuery ? 'Search Results' : 'All Questions'}
          </h3>
        </div>
        {searchQuery ? (
          <div className="search-questions">
            <span style={{ color: '#acb2b8', fontSize: '12px' }}>
              Results for {searchQuery}
            </span>
            <SearchBox placeholder={'Search...'} name={'search'} pt={'mt8'} />
          </div>
        ) : (
          ''
        )}
        <div className="questions">
          {foundPosts.length > 0 ? (
            foundPosts.map((post) => <PostItem key={post.id} post={post} />)
          ) : (
            <div className="no-results">{`No results found for "${searchQuery}".`}</div>
          )}
        </div>
      </div>
      <Spacer minH={20} />
    </Fragment>
  )
}

export default SearchResults
