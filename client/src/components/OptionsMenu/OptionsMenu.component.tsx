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

  useEffect(() => {
    setQueryState(getTopicsQuery(location.search))
    const topicsSpecified = isSpecified(location.search, 'topics')
    setHasTopicsKey(topicsSpecified)
  })

  const accordionRef: React.LegacyRef<HTMLButtonElement> = createRef()

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

  // TODO: <Flex> is repeated for tagsToShow and agencyShortNames, figure out a way to apply DRY
  const optionsMenu = (
    <SimpleGrid
      templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
      maxW="620px"
      m="auto"
      spacingX={
        hasTopicsKey ? { base: undefined, sm: '16px' } : { base: '16px' }
      }
      spacingY={
        hasTopicsKey ? { base: undefined, sm: '16px' } : { base: '16px' }
      }
      py={hasTopicsKey ? { base: undefined, sm: '48px' } : { base: '48px' }}
    >
      {agency
        ? topicsToShow.map(({ id, name }) => {
            return (
              <Flex
                h="72px"
                w={hasTopicsKey ? '100%' : { base: '87%', sm: '100%' }}
                mx={hasTopicsKey ? undefined : { base: 'auto', md: undefined }}
                alignItems="center"
                textAlign="left"
                textStyle="h4"
                boxShadow="base"
                role="group"
                borderTopWidth={
                  hasTopicsKey ? { base: '1px', sm: '0px' } : undefined
                }
                borderTopColor={hasTopicsKey ? 'secondary.500' : undefined}
                bg="secondary.700"
                color="white"
                _hover={{ bg: 'secondary.600', boxShadow: 'lg' }}
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
                h="72px"
                w={hasTopicsKey ? '100%' : { base: '87%', sm: '100%' }}
                mx={hasTopicsKey ? undefined : { base: 'auto', md: undefined }}
                alignItems="center"
                textAlign="left"
                textStyle="h4"
                boxShadow="base"
                role="group"
                borderTopWidth={
                  hasTopicsKey ? { base: '1px', sm: '0px' } : undefined
                }
                borderTopColor={hasTopicsKey ? 'secondary.500' : undefined}
                bg="secondary.700"
                color="white"
                _hover={{ bg: 'secondary.600', boxShadow: 'lg' }}
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
          px="0px"
          py="0px"
          pt={hasTopicsKey ? '24px' : undefined}
          pb={hasTopicsKey ? '16px' : undefined}
          shadow="md"
          _expanded={
            hasTopicsKey
              ? { shadow: 'none' }
              : !agency
              ? { color: 'primary.500' }
              : undefined
          }
          _hover={{ bg: hasTopicsKey ? 'secondary.600' : undefined }}
          bg={hasTopicsKey ? 'secondary.700' : 'secondary.800'}
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
                pt={hasTopicsKey ? '8px' : undefined}
                mt={hasTopicsKey ? undefined : '36px'}
              >
                {agency
                  ? hasTopicsKey
                    ? 'TOPIC'
                    : 'EXPLORE A TOPIC'
                  : 'AGENCIES'}
              </Text>
              {hasTopicsKey ? (
                <Text
                  textStyle="h3"
                  fontWeight={queryState ? '600' : '400'}
                  color="white"
                  pt="8px"
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
