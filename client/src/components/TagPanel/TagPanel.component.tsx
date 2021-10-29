import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Spinner,
  Text,
  Flex,
  Spacer,
  SimpleGrid,
} from '@chakra-ui/react'
import * as FullStory from '@fullstory/browser'
import { BiRightArrowAlt } from 'react-icons/bi'
import { ReactElement } from 'react'
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
import { getRedirectURL } from '../../util/urlparser'

const TagPanel = (): ReactElement => {
  const { agency: agencyShortName } = useParams<{ agency: string }>()
  const { data: agency } = useQuery<Agency>(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    // Only getAgencyByShortName if agency param is present in URL
    // If agency URL param is not present, agencyShortName is undefined
    { enabled: agencyShortName !== undefined },
  )

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
    .filter(({ tagType }) => tagType === TagType.Topic)
    .sort(bySpecifiedOrder)

  const TagMenu = (
    <SimpleGrid
      templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
      maxW="620px"
      m="auto"
      spacingX="16px"
      spacingY="16px"
      py="48px"
    >
      {tagsToShow.map(({ id, tagType, tagname }) => {
        return (
          <Flex
            h="72px"
            alignItems="center"
            w={{ base: '87%', sm: '100%' }}
            mx={{ base: 'auto', md: undefined }}
            textAlign="left"
            textStyle="h4"
            boxShadow="base"
            role="group"
            _hover={{ bg: 'secondary.600', boxShadow: 'lg' }}
            bg="secondary.700"
            color="white"
            as={RouterLink}
            key={id}
            to={getRedirectURL(tagType, tagname, agency)}
            onClick={() => sendClickTagEventToAnalytics(tagname)}
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
    <Accordion defaultIndex={[0]} allowMultiple bg="secondary.800">
      <AccordionItem border="none">
        <AccordionButton
          px="0px"
          py="0px"
          _expanded={!agency ? { color: 'primary.500' } : undefined}
        >
          <Flex maxW="680px" m="auto" w="100%" px={8} textAlign="left">
            <Text textStyle="subhead-3" color="primary.400" mt="36px">
              EXPLORE A TOPIC
            </Text>
          </Flex>
        </AccordionButton>
        <AccordionPanel p={0} shadow="md">
          {isLoading && <Spinner />}
          {TagMenu}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default TagPanel
