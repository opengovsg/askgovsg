import { useState } from 'react'
import { RefCallBack } from 'react-hook-form'
import { BiSearch } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
} from '@chakra-ui/input'
import { Box, Flex, UnorderedList } from '@chakra-ui/layout'
import { CSSObject, useMultiStyleConfig } from '@chakra-ui/react'
import * as FullStory from '@fullstory/browser'
import Downshift, {
  DownshiftState,
  GetItemPropsOptions,
  StateChangeOptions,
} from 'downshift'

import { SearchEntryWithHighlight } from '~shared/types/api'

import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import {
  GET_AGENCY_BY_ID_QUERY_KEY,
  getAgencyById,
} from '../../services/AgencyService'
import { search, SEARCH_QUERY_KEY } from '../../services/SearchService'

export const SearchBox = ({
  sx = {},
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
  sx?: CSSObject
  placeholder?: string
  value?: string
  inputRef?: RefCallBack
  handleSubmit?: (inputValue: string | null) => void
  handleAbandon?: (inputValue: string | null) => void
  searchOnEnter?: boolean
  showSearchIcon?: boolean
  agencyId?: number
} & InputProps): JSX.Element => {
  const styles = useMultiStyleConfig('SearchBox', {})

  const [searchQueryStrState, setSearchQueryStrState] = useState('')
  const [searchEntriesState, setSearchEntriesState] = useState<
    SearchEntryWithHighlight[]
  >([])

  useQuery(
    [SEARCH_QUERY_KEY, agencyId, searchQueryStrState],
    () => search({ query: searchQueryStrState, agencyId }),
    {
      onSuccess: (data) => {
        setSearchEntriesState(data)
      },
    },
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

  // null type required due to Downshift's type definitions
  // eslint-disable-next-line
  const itemToString = (item: SearchEntryWithHighlight | null) =>
    item?.result.title ?? ''

  const stateReducer = (
    _state: DownshiftState<SearchEntryWithHighlight>,
    changes: StateChangeOptions<SearchEntryWithHighlight>,
  ) => {
    return changes.type === Downshift.stateChangeTypes.blurInput ||
      changes.type === Downshift.stateChangeTypes.mouseUp ||
      changes.type === Downshift.stateChangeTypes.touchEnd
      ? { isOpen: false } // no-changes
      : changes
  }

  const SearchItem = ({
    item,
    index,
    getItemProps,
    highlightedIndex,
    itemToString,
    onClick,
  }: {
    item: SearchEntryWithHighlight
    index: number
    getItemProps: (
      options: GetItemPropsOptions<SearchEntryWithHighlight>,
    ) => SearchEntryWithHighlight
    highlightedIndex: number | null
    itemToString: (item: SearchEntryWithHighlight | null) => string
    onClick: () => void
  }) => (
    <Link
      to={`/questions/${item.result.postId}`}
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
        onClick,
      })}
    >
      <Box as="span" sx={styles.item}>
        {itemToString(item)}
      </Box>
    </Link>
  )

  return (
    <Flex sx={{ ...styles.form, ...sx }}>
      <Downshift
        onChange={(selection) =>
          navigate(`/questions/${selection?.result.postId}`)
        }
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
          <Box {...getRootProps()} sx={styles.autocomplete}>
            <InputGroup onBlur={() => onAbandon(inputValue)} sx={styles.box}>
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
                textStyle="h3"
                sx={styles.input}
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
                  onKeyUpCapture: () => {
                    setSearchQueryStrState(inputValue ?? '')
                  },
                })}
              />
            </InputGroup>
            <UnorderedList sx={styles.results} {...getMenuProps()}>
              {isOpen && inputValue
                ? searchEntriesState.map((entry, index) => {
                    return (
                      <SearchItem
                        key={entry.result.postId}
                        onClick={() => sendSearchEventToAnalytics(inputValue)}
                        {...{
                          item: entry,
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
