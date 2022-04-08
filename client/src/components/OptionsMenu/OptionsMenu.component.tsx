import { createRef, LegacyRef, ReactElement, useContext } from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { Link as RouterLink, useParams } from 'react-router-dom'
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

import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import { HomePageContext } from '../../contexts/HomePageContext'
import {
  Agency,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
  GET_LIST_OF_ALL_AGENCIES,
  getAgencyByShortName,
  getListOfAllAgencies,
} from '../../services/AgencyService'
import {
  GET_TOPICS_USED_BY_AGENCY_QUERY_KEY,
  getTopicsUsedByAgency,
} from '../../services/TopicService'
import {
  getRedirectURLAgency,
  getRedirectURLTopics,
} from '../../util/urlparser'

import { bySpecifiedOrder } from './util'

const OptionsMenu = (): ReactElement => {
  const { agency: agencyShortName } = useParams<'agency'>()
  const { data: agency } = useQuery<Agency>(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: `${agencyShortName}` }),
    // Only getAgencyByShortName if agency param is present in URL
    // If agency URL param is not present, agencyShortName is undefined
    { enabled: agencyShortName !== undefined },
  )

  const { urlHasTopicsParamKey, topicQueried, setTopicQueried } =
    useContext(HomePageContext)
  const styles = useMultiStyleConfig('OptionsMenu', { urlHasTopicsParamKey })

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

  const { isLoading, data: topics } = useQuery(
    GET_TOPICS_USED_BY_AGENCY_QUERY_KEY,
    () => getTopicsUsedByAgency(Number(agency?.id)),
    { enabled: !!agency },
  )

  const { data: listOfAllAgencies } = useQuery(GET_LIST_OF_ALL_AGENCIES, () =>
    getListOfAllAgencies(),
  )

  const topicsToShow = (topics || [])
    .filter((topic) => topic.name !== topicQueried)
    .sort(bySpecifiedOrder(agency))

  const agencyNamesToShow = (listOfAllAgencies || []).map((agency) => {
    return {
      shortname: agency.shortname,
      longname: agency.longname,
    }
  })

  const OptionsItem = (option: string) => {
    return (
      <Flex m="auto" w="100%" px={8}>
        <Text maxW="244px">{option}</Text>
        <Spacer />
        <Flex alignItems="center">
          <BiRightArrowAlt />
        </Flex>
      </Flex>
    )
  }

  const optionsMenu = (
    <SimpleGrid sx={styles.accordionGrid}>
      {agency
        ? topicsToShow.map(({ id, name }) => {
            return (
              <Flex
                sx={styles.accordionItem}
                role="group"
                as={RouterLink}
                key={id}
                to={getRedirectURLTopics(name, agency.shortname)}
                onClick={() => {
                  sendClickTopicEventToAnalytics(name)
                  setTopicQueried(name)
                  accordionRef.current?.click()
                }}
              >
                {OptionsItem(name)}
              </Flex>
            )
          })
        : agencyNamesToShow.map((agency) => {
            return (
              <Flex
                sx={styles.accordionItem}
                role="group"
                as={RouterLink}
                key={agency.shortname}
                to={getRedirectURLAgency(agency.shortname)}
              >
                {OptionsItem(
                  `${agency.longname} (${agency.shortname.toUpperCase()})`,
                )}
              </Flex>
            )
          })}
    </SimpleGrid>
  )

  const accordionMenu = (
    <Accordion
      id="options-menu-accordion"
      allowMultiple
      allowToggle
      index={urlHasTopicsParamKey ? undefined : [0]}
    >
      <AccordionItem border="none">
        <AccordionButton
          ref={accordionRef}
          sx={styles.accordionButton}
          _expanded={
            urlHasTopicsParamKey
              ? { shadow: 'none' }
              : !agency
              ? { color: 'primary.500' }
              : undefined
          }
          _hover={{ bg: urlHasTopicsParamKey ? 'secondary.600' : undefined }}
        >
          <Flex sx={styles.accordionFlexBox} role="group">
            <Stack spacing={1}>
              <Text sx={styles.accordionHeader}>
                {agency
                  ? urlHasTopicsParamKey
                    ? 'TOPIC'
                    : 'EXPLORE A TOPIC'
                  : 'AGENCIES'}
              </Text>
              {urlHasTopicsParamKey && (
                <Text
                  sx={styles.accordionSubHeader}
                  fontWeight={topicQueried ? '600' : '400'}
                >
                  {agency
                    ? topicQueried
                      ? topicQueried
                      : 'Select a Topic'
                    : 'Select an Agency'}
                </Text>
              )}
            </Stack>
            <Spacer />
            <AccordionIcon
              mt="48px"
              color={urlHasTopicsParamKey ? 'white' : 'secondary.800'}
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

  return <>{accordionMenu}</>
}

export default OptionsMenu
