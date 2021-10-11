import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Link,
  Spinner,
  Text,
  VStack,
  Flex,
  Spacer,
  Stack,
} from '@chakra-ui/react'
import * as FullStory from '@fullstory/browser'
import { BiRightArrowAlt } from 'react-icons/bi'
import { useEffect, useState, ReactElement, createRef } from 'react'
import { useQuery } from 'react-query'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { TagType } from '~shared/types/base'
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import {
  Agency,
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import {
  fetchTags,
  FETCH_TAGS_QUERY_KEY,
  getTagsUsedByAgency,
  GET_TAGS_USED_BY_AGENCY_QUERY_KEY,
} from '../../services/tag.service'
import { getTagsQuery } from '../../util/urlparser'
import { getRedirectURL } from '../../util/urlparser'

const TagMenu = (): ReactElement => {
  const { agency: agencyShortName } = useParams<{ agency: string }>()
  const { data: agency } = useQuery<Agency>(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    // Only getAgencyByShortName if agency param is present in URL
    // If agency URL param is not present, agencyShortName is undefined
    { enabled: agencyShortName !== undefined },
  )

  const [queryState, setQueryState] = useState('')
  // TODO (#259): make into custom hook
  useEffect(() => {
    setQueryState(getTagsQuery(location.search))
  })

  const accordionRef: React.LegacyRef<HTMLButtonElement> = createRef()

  const googleAnalytics = useGoogleAnalytics()

  const sendClickTagEventToAnalytics = (tagName: string) => {
    const timeToTagClick = Date.now() - googleAnalytics.appLoadTime
    googleAnalytics.sendUserEvent(
      googleAnalytics.GA_USER_EVENTS.CLICK_TAG,
      tagName,
      timeToTagClick,
    )
    googleAnalytics.sendTiming(
      'User',
      'Time to first tag click',
      timeToTagClick,
    )
    FullStory.event(googleAnalytics.GA_USER_EVENTS.CLICK_TAG, {
      tag_str: tagName,
      timeToTagClick_int: timeToTagClick,
    })
  }

  const { isLoading, data: tags } = agency
    ? useQuery(GET_TAGS_USED_BY_AGENCY_QUERY_KEY, () =>
        getTagsUsedByAgency(agency.id),
      )
    : useQuery(FETCH_TAGS_QUERY_KEY, () => fetchTags())

  // TODO - create an AccordionItem for agency tags
  return (
    <Accordion allowMultiple allowToggle>
      <AccordionItem border="none">
        <h2>
          <AccordionButton
            ref={accordionRef}
            borderBottomWidth="1px"
            px="0px"
            pt="24px"
            pb="16px"
            bg="primary.100"
            shadow="md"
            _expanded={{ shadow: 'none' }}
            _hover={{ bg: 'primary.200' }}
          >
            <Flex
              maxW="680px"
              m="auto"
              w="100%"
              px={8}
              textAlign="left"
              role="group"
            >
              <Stack spacing={1}>
                <Text
                  textStyle="subhead-3"
                  color="secondary.500"
                  pt="8px"
                  _groupHover={{ color: 'primary.600' }}
                >
                  TOPIC
                </Text>
                <Text
                  _groupHover={{ color: 'primary.600' }}
                  textStyle="h3"
                  fontWeight={queryState ? '600' : '400'}
                  color="secondary.500"
                  pt="8px"
                >
                  {queryState ? queryState : 'Select a Topic'}
                </Text>
              </Stack>
              <Spacer />
              <AccordionIcon mt="48px" />
            </Flex>
          </AccordionButton>
        </h2>
        <AccordionPanel p={0} shadow="md">
          {isLoading && <Spinner />}
          {tags && (
            <VStack align="left" spacing={0}>
              {tags
                .filter(
                  ({ tagType, tagname }) =>
                    tagType === TagType.Topic && tagname !== queryState,
                )
                .sort((a, b) => (a.tagname > b.tagname ? 1 : -1))
                .map((tag) => {
                  const { tagType, tagname } = tag
                  return (
                    <Link
                      py="24px"
                      w="100%"
                      textAlign="left"
                      textStyle="h4"
                      borderBottomWidth="1px"
                      role="group"
                      _hover={{ bg: 'primary.100' }}
                      _focus={{
                        color: 'primary.600',
                      }}
                      as={RouterLink}
                      key={tag.id}
                      to={getRedirectURL(tagType, tagname, agency)}
                      onClick={() => {
                        sendClickTagEventToAnalytics(tagname)
                        setQueryState(tagname)
                        accordionRef.current?.click()
                      }}
                    >
                      <Flex maxW="680px" m="auto" w="100%" px={8}>
                        <Text _groupHover={{ color: 'primary.600' }}>
                          {tag.tagname}
                        </Text>
                        <Spacer />
                        <BiRightArrowAlt />
                      </Flex>
                    </Link>
                  )
                })}
            </VStack>
          )}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default TagMenu
