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
  useMultiStyleConfig,
} from '@chakra-ui/react'
import * as FullStory from '@fullstory/browser'
import { BiRightArrowAlt } from 'react-icons/bi'
import { LegacyRef, useEffect, useState, ReactElement, createRef } from 'react'
import { useQuery } from 'react-query'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { Topic } from '~shared/types/base'
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import {
  Agency,
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
  listAgencyShortNames,
  LIST_AGENCY_SHORTNAMES,
} from '../../services/AgencyService'
import {
  fetchTopics,
  FETCH_TOPICS_QUERY_KEY,
  getTopicsUsedByAgency,
  GET_TOPICS_USED_BY_AGENCY_QUERY_KEY,
} from '../../services/TopicService'
import {
  getRedirectURLTopics,
  getRedirectURLAgency,
  isSpecified,
  getTopicsQuery,
} from '../../util/urlparser'

const OptionsMenu = (): ReactElement => {
  const [hasTopicsKey, setHasTopicsKey] = useState(false)
  const { agency: agencyShortName } = useParams<'agency'>()
  const { data: agency } = useQuery<Agency>(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: `${agencyShortName}` }),
    // Only getAgencyByShortName if agency param is present in URL
    // If agency URL param is not present, agencyShortName is undefined
    { enabled: agencyShortName !== undefined },
  )

  const [queryState, setQueryState] = useState('')
  const styles = useMultiStyleConfig('OptionsMenu', { hasTopicsKey })

  useEffect(() => {
    setQueryState(getTopicsQuery(location.search))
    const topicsSpecified = isSpecified(location.search, 'topics')
    setHasTopicsKey(topicsSpecified)
  })

  const accordionRef: LegacyRef<HTMLButtonElement> = createRef()

  const googleAnalytics = useGoogleAnalytics()

  const sendClickTopicEventToAnalytics = (topicName: string) => {
    const timeToTopicClick = Date.now() - googleAnalytics.appLoadTime
    googleAnalytics.sendUserEvent(
      googleAnalytics.GA_USER_EVENTS.CLICK_TAG,
      topicName,
      timeToTopicClick,
    )
    googleAnalytics.sendTiming(
      'User',
      'Time to first topic click',
      timeToTopicClick,
    )
    FullStory.event(googleAnalytics.GA_USER_EVENTS.CLICK_TAG, {
      topic_str: topicName,
      timeToTopicClick_int: timeToTopicClick,
    })
  }

  const { isLoading, data: topics } = agency
    ? useQuery(GET_TOPICS_USED_BY_AGENCY_QUERY_KEY, () =>
        getTopicsUsedByAgency(agency.id),
      )
    : useQuery(FETCH_TOPICS_QUERY_KEY, () => fetchTopics())

  const { data: agencyShortNames } = useQuery(LIST_AGENCY_SHORTNAMES, () =>
    listAgencyShortNames(),
  )

  const bySpecifiedOrder =
    agency && Array.isArray(agency.displayOrder)
      ? (a: Topic, b: Topic) => {
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
            return a.name > b.name ? 1 : -1
          }
        }
      : (a: Topic, b: Topic) => (a.name > b.name ? 1 : -1)

  const topicsToShow = (topics || [])
    .filter((topic) => topic.name !== queryState)
    .sort(bySpecifiedOrder)

  const agencyShortNamesToShow = (agencyShortNames || [])
    .map((agency) => agency.shortname)
    .filter((shortname) => shortname !== agencyShortName)

  const optionsMenu = (
    <SimpleGrid sx={styles.accordionGrid}>
      {agency
        ? topicsToShow.map(({ id, name }) => {
            return (
              <Flex
                sx={styles.accordionItem}
                _hover={{ bg: 'secondary.600', boxShadow: 'lg' }}
                role="group"
                as={RouterLink}
                key={id}
                to={getRedirectURLTopics(name, agency)}
                onClick={() => {
                  sendClickTopicEventToAnalytics(name)
                  setQueryState(name)
                  accordionRef.current?.click()
                }}
              >
                <Flex m="auto" w="100%" px={8}>
                  <Text>{name}</Text>
                  <Spacer />
                  <Flex alignItems="center">
                    <BiRightArrowAlt />
                  </Flex>
                </Flex>
              </Flex>
            )
          })
        : agencyShortNamesToShow.map((shortname) => {
            return (
              <Flex
                sx={styles.accordionItem}
                role="group"
                as={RouterLink}
                key={shortname}
                to={getRedirectURLAgency(shortname)}
              >
                <Flex m="auto" w="100%" px={8}>
                  <Text>{shortname.toUpperCase()}</Text>
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
    <Accordion allowMultiple allowToggle index={hasTopicsKey ? undefined : [0]}>
      <AccordionItem border="none">
        <AccordionButton
          ref={accordionRef}
          sx={styles.accordionButton}
          _expanded={
            hasTopicsKey
              ? { shadow: 'none' }
              : !agency
              ? { color: 'primary.500' }
              : undefined
          }
          _hover={{ bg: hasTopicsKey ? 'secondary.600' : undefined }}
        >
          <Flex sx={styles.accordionFlexBox} role="group">
            <Stack spacing={1}>
              <Text sx={styles.accordionHeader}>
                {agency
                  ? hasTopicsKey
                    ? 'TOPIC'
                    : 'EXPLORE A TOPIC'
                  : 'AGENCIES'}
              </Text>
              {hasTopicsKey ? (
                <Text
                  sx={styles.accordionSubHeader}
                  fontWeight={queryState ? '600' : '400'}
                >
                  {agency
                    ? queryState
                      ? queryState
                      : 'Select a Topic'
                    : 'Select an Agency'}
                </Text>
              ) : (
                <Text></Text>
              )}
            </Stack>
            <Spacer />
            <AccordionIcon
              mt="48px"
              color={hasTopicsKey ? 'white' : 'secondary.800'}
            />
          </Flex>
        </AccordionButton>
        <AccordionPanel p={0} shadow="md" bg="secondary.800">
          {isLoading && <Spinner />}
          {optionsMenu}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default OptionsMenu
