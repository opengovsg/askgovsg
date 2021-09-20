import { Input, InputGroup, InputLeftElement } from '@chakra-ui/input'
import * as FullStory from '@fullstory/browser'
import Downshift from 'downshift'
import Fuse from 'fuse.js'
import { BiSearch } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import {
  listPosts,
  LIST_POSTS_FOR_SEARCH_QUERY_KEY,
} from '../../services/PostService'
import './SearchBox.styles.scss'
import { useRef } from 'react'

const SearchBox = ({
  placeholder,
  value,
  inputRef,
  handleSubmit = undefined,
  handleAbandon = (_inputValue) => {},
  searchOnEnter = true,
  showSearchIcon = true,
  agencyShortName,
  ...inputProps
}) => {
  /*
  Use LIST_POSTS_FOR_SEARCH_QUERY_KEY instead of LIST_POSTS_QUERY_KEY
  Because the queries using LIST_POST_QUERY_KEY may be filtered by tags.
  Use a separate query here to return all unfiltered posts for
  client-side search 
  */
  const { data } = useQuery(
    [LIST_POSTS_FOR_SEARCH_QUERY_KEY, agencyShortName],
    // TODO: refactor to better split between when agencyShortName is present
    () => listPosts(undefined, agencyShortName),
  )

  const history = useHistory()
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
    FullStory.event('Search', {
      timeToFirstSearch_int: timeToFirstSearch,
    })
    googleAnalytics.hasSearched = true
  }

  placeholder = placeholder ?? 'How can we help you?'
  value = value ?? ''
  if (!handleSubmit) {
    handleSubmit = (inputValue) =>
      history.push(
        `/questions?search=${inputValue}` +
          (agencyShortName ? `&agency=${agencyShortName}` : ''),
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
          onChange={(selection) => history.push(`/questions/${selection.id}`)}
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
                  <InputLeftElement
                    children={<BiSearch size="24" color="secondary.500" />}
                    h="100%"
                    w="24px"
                    ml="19px"
                    mr="20px"
                  />
                ) : null}
                <Input
                  variant={showSearchIcon ? 'unstyled' : undefined}
                  className="search-input"
                  sx={{ paddingInlineStart: showSearchIcon ? '63px' : '16px' }}
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
              '#e4e7f6' //using primary 200
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
