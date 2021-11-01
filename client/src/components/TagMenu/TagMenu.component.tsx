import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Spinner,
  Text,
  Flex,
  Spacer,
  Stack,
  SimpleGrid,
} from '@chakra-ui/react'
import * as FullStory from '@fullstory/browser'
import { BiRightArrowAlt } from 'react-icons/bi'
import { useEffect, useState, ReactElement, createRef } from 'react'
import { useQuery } from 'react-query'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { Tag, TagType } from '~shared/types/base'
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
} from '../../services/TagService'
import { getTagsQuery, isSpecified } from '../../util/urlparser'
import { getRedirectURL } from '../../util/urlparser'

const TagMenu = (): ReactElement => {
  const [hasTagsKey, setHasTagsKey] = useState(false)
  const { agency: agencyShortName } = useParams<{ agency: string }>()
  const { data: agency } = useQuery<Agency>(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    // Only getAgencyByShortName if agency param is present in URL
    // If agency URL param is not present, agencyShortName is undefined
    { enabled: agencyShortName !== undefined },
  )

  const [queryState, setQueryState] = useState('')

  useEffect(() => {
    setQueryState(getTagsQuery(location.search))
    const tagsSpecified = isSpecified(location.search, 'tags')
    setHasTagsKey(tagsSpecified)
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

  const bySpecifiedOrder =
    agency && Array.isArray(agency.displayOrder)
      ? (a: Tag, b: Tag) => {
          const aDisplayOrder = (agency.displayOrder || []).indexOf(a.id)
          const bDisplayOrder = (agency.displayOrder || []).indexOf(b.id)
          if (aDisplayOrder !== -1 && bDisplayOrder !== -1) {
            return aDisplayOrder > bDisplayOrder ? 1 : -1
          } else if (aDisplayOrder !== -1) {
            // a has an enforced display order, so a should be further up
            return -1
          } else if (bDisplayOrder !== -1) {
            // b has an enforced display order, so a should be further down
            return 1
          } else {
            return a.tagname > b.tagname ? 1 : -1
          }
        }
      : (a: Tag, b: Tag) => (a.tagname > b.tagname ? 1 : -1)

  const tagsToShow = (tags || [])
    .filter(
      ({ tagType, tagname }) =>
        tagType === TagType.Topic && tagname !== queryState,
    )
    .sort(bySpecifiedOrder)

  const tagMenu = (
    <SimpleGrid
      templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
      maxW="620px"
      m="auto"
      spacingX={hasTagsKey ? { base: undefined, sm: '16px' } : { base: '16px' }}
      spacingY={hasTagsKey ? { base: undefined, sm: '16px' } : { base: '16px' }}
      py={hasTagsKey ? { base: undefined, sm: '48px' } : { base: '48px' }}
    >
      {tagsToShow.map(({ id, tagType, tagname }) => {
        return (
          <Flex
            h="72px"
            w="100%"
            alignItems="center"
            textAlign="left"
            textStyle="h4"
            boxShadow="base"
            role="group"
            borderTopWidth={hasTagsKey ? { base: '1px', sm: '0px' } : undefined}
            borderTopColor={hasTagsKey ? 'secondary.500' : undefined}
            bg="secondary.700"
            color="white"
            _hover={{ bg: 'secondary.600', boxShadow: 'lg' }}
            as={RouterLink}
            key={id}
            to={getRedirectURL(tagType, tagname, agency)}
            onClick={() => {
              sendClickTagEventToAnalytics(tagname)
              setQueryState(tagname)
              accordionRef.current?.click()
            }}
          >
            <Flex m="auto" w="100%" px={8}>
              <Text>{tagname}</Text>
              <Spacer />
              <Flex alignItems="center">
                <BiRightArrowAlt />
              </Flex>
            </Flex>
          </Flex>
        )
      })}
    </SimpleGrid>
  )

  return (
    <Accordion allowMultiple allowToggle index={hasTagsKey ? undefined : [0]}>
      <AccordionItem border="none">
        <AccordionButton
          ref={accordionRef}
          px="0px"
          py="0px"
          pt={hasTagsKey ? '24px' : undefined}
          pb={hasTagsKey ? '16px' : undefined}
          shadow="md"
          _expanded={
            hasTagsKey
              ? { shadow: 'none' }
              : !agency
              ? { color: 'primary.500' }
              : undefined
          }
          _hover={{ bg: hasTagsKey ? 'secondary.600' : undefined }}
          bg={hasTagsKey ? 'secondary.700' : 'secondary.800'}
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
                color="primary.400"
                pt={hasTagsKey ? '8px' : undefined}
                mt={hasTagsKey ? undefined : '36px'}
              >
                {hasTagsKey ? 'TOPIC' : 'EXPLORE A TOPIC'}
              </Text>
              {hasTagsKey ? (
                <Text
                  textStyle="h3"
                  fontWeight={queryState ? '600' : '400'}
                  color="white"
                  pt="8px"
                >
                  {queryState ? queryState : 'Select a Topic'}
                </Text>
              ) : (
                <Text></Text>
              )}
            </Stack>
            <Spacer />
            <AccordionIcon
              mt="48px"
              color={hasTagsKey ? 'white' : 'secondary.800'}
            />
          </Flex>
        </AccordionButton>
        <AccordionPanel p={0} shadow="md" bg="secondary.800">
          {isLoading && <Spinner />}
          {tagMenu}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default TagMenu
