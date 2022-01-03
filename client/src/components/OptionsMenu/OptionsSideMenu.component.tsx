import { Box, Flex, Text, useMultiStyleConfig } from '@chakra-ui/react'
import * as FullStory from '@fullstory/browser'
import { LegacyRef, useEffect, useState, ReactElement, createRef } from 'react'
import { useQuery } from 'react-query'
import { Link as RouterLink } from 'react-router-dom'
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import { Agency } from '../../services/AgencyService'
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

const OptionsSideMenu = ({ agency }: { agency?: Agency }): ReactElement => {
  const [hasTopicsKey, setHasTopicsKey] = useState(false)

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

  const { data: topics } = agency
    ? useQuery(GET_TOPICS_USED_BY_AGENCY_QUERY_KEY, () =>
        getTopicsUsedByAgency(agency.id),
      )
    : useQuery(FETCH_TOPICS_QUERY_KEY, () => fetchTopics())

  const sideMenu = agency && (
    <Box id="options-menu-side" sx={styles.sideMenuBox}>
      <Text sx={styles.sideMenuTopicHeader}>Topics</Text>
      {topics?.sort(bySpecifiedOrder(agency)).map(({ id, name }) => {
        return (
          <Flex
            sx={styles.sideMenuTopicSelect}
            bg={name === queryState ? 'secondary.100' : undefined}
            as={RouterLink}
            key={id}
            to={getRedirectURLTopics(name, agency)}
            onClick={() => {
              sendClickTopicEventToAnalytics(name)
              setQueryState(name)
              accordionRef.current?.click()
            }}
          >
            <Text sx={styles.sideMenuTopicText}>{name}</Text>
          </Flex>
        )
      })}
    </Box>
  )

  return <>{sideMenu}</>
}

export default OptionsSideMenu
