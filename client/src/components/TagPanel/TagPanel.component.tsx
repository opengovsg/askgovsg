import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Link,
  Spinner,
  Text,
  VStack,
  Flex,
  Spacer,
  Center,
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
} from '../../services/tag.service'
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

  // TODO - create an AccordionItem for agency tags
  return (
    <Accordion defaultIndex={[0]} allowMultiple>
      <AccordionItem border="none">
        <h2>
          <AccordionButton
            h="72px"
            px="0px"
            py="0px"
            _expanded={!agency ? { color: 'primary.500' } : undefined}
          >
            <Flex
              maxW="680px"
              m="auto"
              w="100%"
              px={{ base: 8, md: 8 }}
              textAlign="left"
            >
              <Text textStyle="subhead-3" color="secondary.500" mt="36px">
                TOPICS
              </Text>
            </Flex>
          </AccordionButton>
        </h2>
        <AccordionPanel p={0} shadow="md">
          {isLoading && <Spinner />}
          {tags && (
            <VStack align="left" spacing={0}>
              {tags
                .filter(({ tagType }) => tagType === TagType.Topic)
                .sort(bySpecifiedOrder)
                .map((tag) => {
                  const { tagType, tagname } = tag
                  return (
                    <Link
                      py="24px"
                      w="100%"
                      h="72px"
                      textAlign="center"
                      textStyle="h4"
                      borderBottomWidth="1px"
                      role="group"
                      _hover={{ bg: 'primary.100' }}
                      as={RouterLink}
                      key={tag.id}
                      to={getRedirectURL(tagType, tagname, agency)}
                      onClick={() => sendClickTagEventToAnalytics(tagname)}
                    >
                      <Flex
                        maxW="680px"
                        m="auto"
                        w="100%"
                        px={{ base: 8, md: 8 }}
                      >
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

export default TagPanel
