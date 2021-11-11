import {
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
} from '@chakra-ui/input'
import { Box, Flex, UnorderedList } from '@chakra-ui/layout'
import * as FullStory from '@fullstory/browser'
import Downshift, {
  DownshiftState,
  GetItemPropsOptions,
  StateChangeOptions,
} from 'downshift'
import Fuse from 'fuse.js'
import { RefCallBack } from 'react-hook-form'
import { BiSearch } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import { BasePostDto } from 'src/api'
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import {
  getAgencyById,
  GET_AGENCY_BY_ID_QUERY_KEY,
} from '../../services/AgencyService'
import {
  listPosts,
  LIST_POSTS_FOR_SEARCH_QUERY_KEY,
} from '../../services/PostService'
import './SearchBox.styles.scss'

export const SearchBox = ({
  placeholder,
  value,
  inputRef,
  handleSubmit = undefined,
  // eslint-disable-next-line
  handleAbandon = (_inputValue) => {},
  searchOnEnter = true,
  showSearchIcon = true,
  agencyId,
  ...inputProps
}: {
  placeholder?: string
  value?: string
  inputRef?: RefCallBack
  handleSubmit?: (inputValue: string | null) => void
  handleAbandon?: (inputValue: string | null) => void
  searchOnEnter?: boolean
  showSearchIcon?: boolean
  agencyId?: number
} & InputProps): JSX.Element => {
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
    () => getAgencyById(Number(agencyId)),
    { enabled: !!agencyId },
  )

  const navigate = useNavigate()
  const name = 'search'

  const googleAnalytics = useGoogleAnalytics()
  const sendSearchEventToAnalytics = (searchString: string | null) => {
    googleAnalytics.sendUserEvent(
      googleAnalytics.GA_USER_EVENTS.SEARCH,
      `${searchString}`,
    )
    FullStory.event(googleAnalytics.GA_USER_EVENTS.SEARCH, {
      // property name uses `ident_type` pattern
      searchString_str: searchString,
    })
  }
  const sendAbandonedSearchEventToAnalytics = (searchString: string | null) => {
    googleAnalytics.sendUserEvent(
      googleAnalytics.GA_USER_EVENTS.ABANDONED,
      `${searchString}`,
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

  const onSubmit =
    handleSubmit ||
    ((inputValue: string | null) =>
      navigate(
        `/questions?search=${inputValue}` +
          (agency ? `&agency=${agency.shortname}` : ''),
      ))

  const onAbandon = (inputValue: string | null) => {
    sendAbandonedSearchEventToAnalytics(inputValue)
    handleAbandon(inputValue)
  }

  const itemToString = (item: BasePostDto | null) => (item ? item.title : '')

  const fuse = new Fuse(data?.posts || [], {
    keys: ['title', 'description'],
  })

  const stateReducer = (
    _state: DownshiftState<BasePostDto>,
    changes: StateChangeOptions<BasePostDto>,
  ) => {
    return changes.type === Downshift.stateChangeTypes.blurInput ||
      changes.type === Downshift.stateChangeTypes.mouseUp ||
      changes.type === Downshift.stateChangeTypes.touchEnd
      ? { isOpen: false } // no-changes
      : changes
  }

  return (
    <Flex className="search-form">
      <Downshift
        onChange={(selection) => navigate(`/questions/${selection?.id}`)}
        stateReducer={stateReducer}
        itemToString={itemToString}
        initialInputValue={value}
      >
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          getRootProps,
          isOpen,
          inputValue,
          highlightedIndex,
        }) => (
          <Box {...getRootProps()} className="search-autocomplete">
            <InputGroup
              onBlur={() => onAbandon(inputValue)}
              className="search-box"
            >
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
                  onClick={() => onSubmit(inputValue)}
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
                  onKeyDown: (event: KeyboardEvent) => {
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
                        onSubmit(inputValue)
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
            <UnorderedList
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
            </UnorderedList>
          </Box>
        )}
      </Downshift>
    </Flex>
  )
}

const SearchItem = ({
  item,
  index,
  getItemProps,
  highlightedIndex,
  itemToString,
  onClick,
}: {
  item: BasePostDto
  index: number
  getItemProps: (
    options: GetItemPropsOptions<BasePostDto>,
  ) => Omit<BasePostDto, 'id'>
  highlightedIndex: number | null
  itemToString: (item: BasePostDto | null) => string
  onClick: () => void
}) => (
  <Link
    to={`/questions/${item.id}`}
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
      onClick,
    })}
  >
    <Box as="span" className="search-item-text">
      {itemToString(item)}
    </Box>
  </Link>
)
