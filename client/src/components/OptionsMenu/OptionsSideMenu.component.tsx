import { createRef, LegacyRef, ReactElement, useContext } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Flex, Text, useMultiStyleConfig } from '@chakra-ui/react'
import * as FullStory from '@fullstory/browser'

import { Agency } from '~shared/types/base'

import { GetTopicsDto } from '../../api'
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import { HomePageContext } from '../../contexts/HomePageContext'
import { getRedirectURLTopics } from '../../util/urlparser'

import { bySpecifiedOrder } from './util'

const OptionsSideMenu = ({
  agency,
  topics,
}: {
  agency?: Agency
  topics?: GetTopicsDto[] | undefined
}): ReactElement => {
  const { topicQueried, setTopicQueried } = useContext(HomePageContext)
  const styles = useMultiStyleConfig('OptionsMenu', {})

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

  const sideMenu = agency && (
    <Box id="options-menu-side" sx={styles.sideMenuBox}>
      <Text sx={styles.sideMenuTopicHeader}>Topics</Text>
      {topics?.sort(bySpecifiedOrder(agency)).map(({ id, name }) => {
        return (
          <Flex
            sx={styles.sideMenuTopicSelect}
            bg={name === topicQueried ? 'secondary.100' : undefined}
            as={RouterLink}
            key={id}
            to={getRedirectURLTopics(name, agency.shortname)}
            onClick={() => {
              sendClickTopicEventToAnalytics(name)
              setTopicQueried(name)
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
