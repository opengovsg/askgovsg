import { ReactElement, useContext } from 'react'
import { useQuery } from 'react-query'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
  SimpleGrid,
  Spacer,
  Spinner,
  Stack,
  Text,
  useMultiStyleConfig,
} from '@chakra-ui/react'
import * as FullStory from '@fullstory/browser'

import { Agency } from '~shared/types/base'

import { useAuth } from '../../contexts/AuthContext'
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import { HomePageContext } from '../../contexts/HomePageContext'
import {
  GET_TOPICS_USED_BY_AGENCY_QUERY_KEY,
  getTopicsUsedByAgency,
} from '../../services/TopicService'
import { getRedirectURLTopics } from '../../util/urlparser'
import { AddNewTopicCard } from '../Topics/AddNewTopicCard.component'
import { TopicCard } from '../Topics/TopicCard.component'

import { bySpecifiedOrder } from './util'

/*
 * Actually, to make this component truly extensible (i.e. to support nested topics)
 * we should  (1) detect whether it exists at an AgencyHomePage or within a topic
 * (2) render the level of topics accordingly. The interface should be consistent
 * across both instances (which is not the case now; within topic, menu is folded)
 * */
const TopicsMenu = ({ agency }: { agency?: Agency }): ReactElement => {
  const { user } = useAuth()
  const isAgencyMember = user && user.agencyId === agency?.id

  const { topicQueried, setTopicQueried, urlHasTopicsParamKey } =
    useContext(HomePageContext)

  const styles = useMultiStyleConfig('OptionsMenu', {
    urlHasTopicsParamKey,
  })

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

  const { isLoading, data: topics } = useQuery(
    GET_TOPICS_USED_BY_AGENCY_QUERY_KEY,
    () => getTopicsUsedByAgency(Number(agency?.id)),
    { enabled: !!agency },
  )

  const topicsToShow = topics
    ?.filter((topic) => topic.name !== topicQueried)
    .sort(bySpecifiedOrder(agency))

  const optionsMenu = (
    <SimpleGrid sx={styles.accordionGrid}>
      {topicsToShow?.map(({ id, name, description, parentId, agencyId }) => (
        <TopicCard
          key={id}
          id={id}
          topicName={name}
          description={description}
          parentId={parentId}
          agencyId={agencyId}
          isAgencyMember={isAgencyMember}
          url={getRedirectURLTopics(name, `${agency?.shortname}`)}
          setTopicQueried={setTopicQueried}
          sendClickTopicEventToAnalytics={sendClickTopicEventToAnalytics}
        />
      ))}
      {isAgencyMember && <AddNewTopicCard agencyId={user.agencyId} />}
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
        <AccordionButton sx={styles.accordionButton} _hover={{ bg: undefined }}>
          <Flex sx={styles.accordionFlexBox} role="group">
            <Stack spacing={1}>
              <Text sx={styles.accordionHeader}>
                {isAgencyMember ? 'MANAGE YOUR TOPICS' : 'EXPLORE A TOPIC'}
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

export default TopicsMenu
