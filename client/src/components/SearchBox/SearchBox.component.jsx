import { Input, InputGroup, InputRightElement } from '@chakra-ui/input'
import * as FullStory from '@fullstory/browser'
import Downshift from 'downshift'
import Fuse from 'fuse.js'
import { BiSearch } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  getAgencyById,
  GET_AGENCY_BY_ID_QUERY_KEY,
} from '../../services/AgencyService'
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import {
  listPosts,
  LIST_POSTS_FOR_SEARCH_QUERY_KEY,
} from '../../services/PostService'
import './SearchBox.styles.scss'

const SearchBox = ({
  placeholder,
  value,
  inputRef,
  handleSubmit = undefined,
  handleAbandon = (_inputValue) => {},
  searchOnEnter = true,
  showSearchIcon = true,
  agencyId,
  ...inputProps
}) => {
  /*
  Use LIST_POSTS_FOR_SEARCH_QUERY_KEY instead of LIST_POSTS_QUERY_KEY
  Because the queries using LIST_POST_QUERY_KEY may be filtered by tags.
  Use a separate query here to return all unfiltered posts for
  client-side search 
  */
  const { data } = useQuery(
    [LIST_POSTS_FOR_SEARCH_QUERY_KEY, agencyId],
    // TODO: refactor to better split between when agencyShortName is present
    () => listPosts(undefined, agencyId),
  )

  const { data: agency } = useQuery(
    [GET_AGENCY_BY_ID_QUERY_KEY, agencyId],
    () => getAgencyById(agencyId),
    { enabled: !!agencyId },
  )

  const navigate = useNavigate()
  const name = 'search'

  const googleAnalytics = useGoogleAnalytics()
  const sendSearchEventToAnalytics = (searchString) => {
    googleAnalytics.sendUserEvent(
      googleAnalytics.GA_USER_EVENTS.SEARCH,
      searchString,
    )
    FullStory.event(googleAnalytics.GA_USER_EVENTS.SEARCH, {
      // property name uses `ident_type` pattern
      searchString_str: searchString,
    })
  }
  const sendAbandonedSearchEventToAnalytics = (searchString) => {
    googleAnalytics.sendUserEvent(
      googleAnalytics.GA_USER_EVENTS.ABANDONED,
      searchString,
    )
    FullStory.event(googleAnalytics.GA_USER_EVENTS.ABANDONED, {
      // property name uses `ident_type` pattern
      searchString_str: searchString,
    })
  }
  const sendSearchTimingToAnalytics = () => {
    const timeToFirstSearch = Date.now() - googleAnalytics.appLoadTime
    googleAnalytics.sendTiming(
      'User',
      'Time to first search',
      timeToFirstSearch,
    )
    FullStory.event(googleAnalytics.GA_USER_EVENTS.SEARCH, {
      timeToFirstSearch_int: timeToFirstSearch,
    })
    googleAnalytics.hasSearched = true
  }

  placeholder = placeholder ?? 'Search keywords or phrases'
  value = value ?? ''
  if (!handleSubmit) {
    handleSubmit = (inputValue) =>
      navigate(
        `/questions?search=${inputValue}` +
          (agency ? `&agency=${agency.shortname}` : ''),
      )
  }

  const onAbandon = (inputValue) => {
    sendAbandonedSearchEventToAnalytics(inputValue)
    handleAbandon(inputValue)
  }

  const itemToString = (item) => (item ? item.title : '')

  const fuse = new Fuse(data?.posts, {
    keys: ['title', 'description'],
  })

  const stateReducer = (_state, changes) => {
    return [
      Downshift.stateChangeTypes.blurInput,
      Downshift.stateChangeTypes.mouseUp,
      Downshift.stateChangeTypes.touchEnd,
    ].includes(changes.type)
      ? { isOpen: false } // no-changes
      : changes
  }

  return (
    <div className="search-container">
      <div className="search-form">
        <Downshift
          onChange={(selection) => navigate(`/questions/${selection.id}`)}
          stateReducer={stateReducer}
          itemToString={itemToString}
          initialInputValue={value}
        >
          {({
            getInputProps,
            getItemProps,
            getMenuProps,
            isOpen,
            inputValue,
            highlightedIndex,
          }) => (
            <div
              className="search-autocomplete"
              onBlur={() => onAbandon(inputValue)}
            >
              <InputGroup className="search-box">
                {showSearchIcon ? (
                  <InputRightElement
                    bg="primary.500"
                    children={<BiSearch size="24" color="white" />}
                    h="40px"
                    w="40px"
                    mb="8px"
                    mt="8px"
                    mr="8px"
                    borderRadius="4px"
                    cursor="pointer"
                    onClick={() => handleSubmit(inputValue)}
                  />
                ) : null}
                <Input
                  variant="unstyled"
                  className="search-input"
                  sx={{ paddingInlineStart: '16px' }}
                  {...getInputProps({
                    name,
                    placeholder,
                    ref: inputRef,
                    ...inputProps,
                    onKeyDown: (event) => {
                      // when selecting option using keyboard
                      if (event.key === 'Enter') {
                        if (
                          highlightedIndex !== null ||
                          (highlightedIndex === null && searchOnEnter)
                        ) {
                          sendSearchEventToAnalytics(inputValue)
                        }
                        if (highlightedIndex === null && searchOnEnter) {
                          // downshift prevents form submission which is used to submit analytics event
                          // detect such event and explicitly invoke handler
                          handleSubmit(inputValue)
                        }
                      }

                      const isCharacterKey = event.key.length === 1
                      if (isCharacterKey && !googleAnalytics.hasSearched) {
                        sendSearchTimingToAnalytics()
                      }
                    },
                  })}
                />
              </InputGroup>
              <ul
                {...getMenuProps({
                  className: 'search-results',
                })}
              >
                {isOpen && inputValue
                  ? fuse.search(inputValue).map(({ item }, index) => {
                      return (
                        <SearchItem
                          key={item.id}
                          onClick={() => sendSearchEventToAnalytics(inputValue)}
                          {...{
                            item,
                            index,
                            highlightedIndex,
                            getItemProps,
                            itemToString,
                          }}
                        />
                      )
                    })
                  : null}
              </ul>
            </div>
          )}
        </Downshift>
      </div>
    </div>
  )
}

const SearchItem = ({
  item,
  index,
  getItemProps,
  highlightedIndex,
  itemToString,
  onClick,
}) => (
  <Link
    {...getItemProps({
      index,
      item,
      style: {
        backgroundColor:
          highlightedIndex === index
            ? // TODO use classes instead of inlining styles
              'primary.200'
            : 'white',
      },
      className: 'search-item',
      to: `/questions/${item.id}`,
      onClick,
    })}
  >
    <span className="search-item-text">{itemToString(item)}</span>
  </Link>
)

export default SearchBox
