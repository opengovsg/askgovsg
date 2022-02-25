import { Box, Flex, HStack, Spacer, VStack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import AgencyLogo from '../../components/AgencyLogo/AgencyLogo.component'
import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import PageTitle from '../../components/PageTitle/PageTitle.component'
import OptionsMenu from '../../components/OptionsMenu/OptionsMenu.component'
import { useAuth } from '../../contexts/AuthContext'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import {
  fetchTopics,
  FETCH_TOPICS_QUERY_KEY,
  getTopicsUsedByAgency,
  GET_TOPICS_USED_BY_AGENCY_QUERY_KEY,
} from '../../services/TopicService'
import { isUserPublicOfficer } from '../../services/user.service'
import { getTopicsQuery, isSpecified } from '../../util/urlparser'
import OptionsSideMenu from '../../components/OptionsMenu/OptionsSideMenu.component'
import {
  DEFAULT_QUESTIONS_DISPLAY_STATE,
  DEFAULT_QUESTIONS_SORT_STATE,
} from '../../components/Questions/questions'
import { Questions } from '../../components/Questions/Questions.component'

const AgencyHomePage = (): JSX.Element => {
  const [questionsDisplayState, setQuestionsDisplayState] = useState(
    DEFAULT_QUESTIONS_DISPLAY_STATE,
  )
  const [sortState, setSortState] = useState(DEFAULT_QUESTIONS_SORT_STATE)
  const navigate = useNavigate()
  const location = useLocation() // check URL

  const [topicQueryState, setTopicQueryState] = useState('')
  const [hasTopicsKey, setHasTopicsKey] = useState(false)
  useEffect(() => {
    setTopicQueryState(getTopicsQuery(location.search))
    const topicsSpecified = isSpecified(location.search, 'topics')
    setHasTopicsKey(topicsSpecified)
  }, [location, hasTopicsKey])

  const { user } = useAuth()
  const isAuthenticatedOfficer = user !== null && isUserPublicOfficer(user)

  const { agency: agencyShortName } = useParams()
  const { data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: `${agencyShortName}` }),
    { enabled: !!agencyShortName },
  )
  const { data: topics } = agency
    ? useQuery(GET_TOPICS_USED_BY_AGENCY_QUERY_KEY, () =>
        getTopicsUsedByAgency(agency.id),
      )
    : useQuery(FETCH_TOPICS_QUERY_KEY, () => fetchTopics())

  // Is it fair to say officers will almost never be editing questions on tablet/mobile?
  const device = {
    mobile: 'mobile',
    tablet: 'tablet',
    desktop: 'desktop',
  }

  const [deviceType, setDeviceType] = useState(
    window.innerWidth < 480
      ? device.mobile
      : window.innerWidth < 1440
      ? device.tablet
      : device.desktop,
  )

  const checkViewportSize = () => {
    setDeviceType(
      window.innerWidth < 480
        ? device.mobile
        : window.innerWidth < 1440
        ? device.tablet
        : device.desktop,
    )
  }

  useEffect(() => {
    window.addEventListener('resize', checkViewportSize)
    return () => window.removeEventListener('resize', checkViewportSize)
  }, [])

  return (
    <Flex direction="column" height="100%" id="home-page">
      <PageTitle
        title={
          agency ? `${agency?.shortname.toUpperCase()} FAQ - AskGov` : undefined
        }
        description={
          agency
            ? `Answers from ${
                agency?.longname
              } (${agency?.shortname.toUpperCase()})`
            : undefined
        }
      />
      {/*Need help? Answers from AGENCY banner: only shown on agency home page before clicking into topics */}
      {agency && !hasTopicsKey && (
        <HStack
          id="hero-landing-page"
          display="grid"
          gridTemplateColumns="3fr 1fr"
          py="auto"
          minH={{
            base: '175px',
            sm: '232px',
            lg: '224px',
          }}
          width={{
            base: '90%',
            sm: '77vw',
            xl: '50vw',
          }}
          mx={{ base: '24px', sm: 'auto' }}
        >
          <Text
            textStyle={{ base: 'h2-mobile', sm: 'h1-mobile' }}
            color="primary.500"
          >
            Need help?
            <br />
            {agency?.longname && `Answers from ${agency?.longname}`}
          </Text>
          <Flex ml="auto !important">
            {agency && <AgencyLogo agency={agency} />}
          </Flex>
        </HStack>
      )}
      {/*Do we need both hasTopicsKey and topicQueryState? Surely they come together?
      Reasoning is: if isSpecified is false, getTopics query will return '', which is falsy.
      Or is it added to prevent potential bugs (e.g. hasTopicsKey and topQueryState are de-linked somehow)
      UPDATE: oh no I'm wrong, when you click "View All Questions", user is navigated to "?topics="
      which would make hasTopicsKey true but topicsQueryState remains false.
      Ideally, I would want to remove this pattern (viewing all questions has nothing to do with topics).
      */}
      {/* Desktop-only Topic banner: only visible when clicked into topic; coupled with OptionsSideMenu*/}
      {agency &&
        hasTopicsKey &&
        topicQueryState &&
        deviceType === device.desktop && (
          <Flex bg="secondary.800" id="hero-landing-page-desktop">
            <Box ml="46px" pt="128px" position="absolute">
              {agency && <AgencyLogo agency={agency} />}
            </Box>
            <Flex maxW="680px" m="auto" w="100%" minH="224px">
              <VStack alignItems="flex-start" pt="64px">
                <Text textStyle="h2" color="white">
                  {topicQueryState}
                </Text>
                <Text>
                  {(topics ?? [])
                    .filter(({ name }) => name === topicQueryState)
                    .map((topic) => {
                      return topic.description ? (
                        <Text textStyle="body-1" color="white" mb="50px">
                          {topic.description}
                        </Text>
                      ) : null
                    })}
                </Text>
              </VStack>
            </Flex>
          </Flex>
        )}
      {/* Topics Options menu: this is where topics mgmt function will be added*/}
      {/* Currently, this is shown in AgencyHomePage and (topics page + non-desktop view) -> should be decoupled? */}
      {/* In latter, mutually exclusive with (Desktop-only Topic banner + OptionsSideMenu) */}
      {!(deviceType === device.desktop && hasTopicsKey && topicQueryState) && (
        <OptionsMenu />
      )}
      <HStack
        id="main"
        alignItems="flex-start"
        display="grid"
        gridTemplateColumns={{
          base: '1fr',
          xl: hasTopicsKey && topicQueryState ? '1fr 2fr 1fr' : '1fr',
        }}
      >
        {/* Desktop-only topics options side menu*/}
        {deviceType === device.desktop && hasTopicsKey && topicQueryState && (
          <OptionsSideMenu agency={agency} queryStateProp={topicQueryState} />
        )}
        <Flex
          id="questions"
          maxW="680px"
          m="auto"
          justifySelf="center"
          w="100%"
          pt={{ base: '32px', sm: '80px', xl: '90px' }}
          px={8}
          direction={{ base: 'column', lg: 'row' }}
        >
          {deviceType !== device.desktop &&
            (topics ?? [])
              .filter(({ name }) => name === topicQueryState)
              .map((topic) => {
                return topic.description ? (
                  <Text textStyle="body-1" color="neutral.900" mb="50px">
                    {topic.description}
                  </Text>
                ) : null
              })}
          <Questions
            questionsDisplayState={questionsDisplayState}
            setQuestionsDisplayState={setQuestionsDisplayState}
            sortState={sortState}
            setSortState={setSortState}
            isAuthenticatedOfficer={isAuthenticatedOfficer}
            questionsPerPage={
              isAuthenticatedOfficer
                ? 50
                : questionsDisplayState.questionsPerPage
            }
            navigate={navigate}
            showViewAllQuestionsButton={
              isAuthenticatedOfficer || questionsDisplayState.value === 'all'
            }
          />
        </Flex>
      </HStack>
      <Spacer />
      <CitizenRequest agency={agency} />
    </Flex>
  )
}

export default AgencyHomePage
