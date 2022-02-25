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
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import {
  Agency,
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import {
  fetchTopics,
  FETCH_TOPICS_QUERY_KEY,
  getTopicsUsedByAgency,
  GET_TOPICS_USED_BY_AGENCY_QUERY_KEY,
} from '../../services/TopicService'
import {
  getRedirectURLTopics,
  isSpecified,
  getTopicsQuery,
} from '../../util/urlparser'
import { bySpecifiedOrder } from './util'

/*
 * Actually, to make this component truly extensible (i.e. to support nested topics)
 * we should  (1) detect whether it exists at an AgencyHomePage or within a topic
 * (2) render the level of topics accordingly. The interface should be consistent
 * across both instances (which is not the case now; within topic, menu is folded)
 * */
const TopicsManagementMenu = (): ReactElement => {
  const [hasTopicsKey, setHasTopicsKey] = useState(false)
  const { agency: agencyShortName } = useParams<'agency'>()
  const { data: agency } = useQuery<Agency>(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: `${agencyShortName}` }),
    // Only getAgencyByShortName if agency param is present in URL
    // If agency URL param is not present, agencyShortName is undefined
    { enabled: agencyShortName !== undefined },
  )

  const [queryTopicsState, setQueryTopicsState] = useState('')
  const styles = useMultiStyleConfig('OptionsMenu', { hasTopicsKey })

  useEffect(() => {
    setQueryTopicsState(getTopicsQuery(location.search))
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

  const topicsToShow = topics
    ?.filter((topic) => topic.name !== queryTopicsState)
    .sort(bySpecifiedOrder(agency))

  const optionsMenu = (
    // topics mgmt functionality goes here
    <SimpleGrid sx={styles.accordionGrid}>
      {topicsToShow?.map(({ id, name }) => (
        <Flex
          sx={styles.accordionItem}
          _hover={{ bg: 'secondary.600', boxShadow: 'lg' }}
          role="group"
          as={RouterLink}
          key={id}
          to={getRedirectURLTopics(name, agency)}
          onClick={() => {
            sendClickTopicEventToAnalytics(name)
            setQueryTopicsState(name)
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
      ))}
    </SimpleGrid>
  )

  const accordionMenu = (
    <Accordion
      id="options-menu-accordion"
      allowMultiple
      allowToggle
      index={[0]}
    >
      <AccordionItem border="none">
        <AccordionButton
          ref={accordionRef}
          sx={styles.accordionButton}
          _hover={{ bg: undefined }}
        >
          <Flex sx={styles.accordionFlexBox} role="group">
            <Stack spacing={1}>
              <Text sx={styles.accordionHeader}>
                MANAGE YOUR TOPICS (Agency Homepage; TMM here)
              </Text>
            </Stack>
            <Spacer />
            <AccordionIcon mt="48px" color={'secondary.800'} />
          </Flex>
        </AccordionButton>
        <AccordionPanel p={0} shadow="md" bg="secondary.800">
          {isLoading && <Spinner />}
          {optionsMenu}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )

  return <>{accordionMenu}</>
}

export default TopicsManagementMenu
