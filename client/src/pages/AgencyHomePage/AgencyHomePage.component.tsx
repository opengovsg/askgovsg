import {
  Box,
  Button,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Stack,
  VStack,
  Text,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { BiSortAlt2 } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import AgencyLogo from '../../components/AgencyLogo/AgencyLogo.component'
import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import PageTitle from '../../components/PageTitle/PageTitle.component'
import PostQuestionButton from '../../components/PostQuestionButton/PostQuestionButton.component'
import QuestionsList from '../../components/QuestionsList/QuestionsList.component'
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
import { SortQuestionsMenu } from '../../components/SortQuestionsMenu/SortQuestionsMenu.component'

const AgencyHomePage = (): JSX.Element => {
  // const [questionsDisplayState, setQuestionsDisplayState] = useState(
  //   DEFAULT_QUESTIONS_DISPLAY_STATE,
  // )
  // const [sortState, setSortState] = useState(DEFAULT_QUESTIONS_SORT_STATE)
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
  // dropdown options
  const options = [
    { value: 'basic', label: 'Most recent' },
    { value: 'top', label: 'Popular' },
  ]
  // dropdown state, default popular
  const [sortState, setSortState] = useState(options[1])

  const isAuthenticatedOfficer = user !== null && isUserPublicOfficer(user)

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

  // only run once when the page is rendered.
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
      {/*Need help? Answers from AGENCY banner */}
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
      Also, can deviceType === device.desktop && hasTopicsKey && topicQueryState be abstracted as  onDesktopAndSelectedTopic
      UPDATE: oh no I'm wrong, when you click "View All Questions", user is navigated to "?topics=".
      */}
      {/* Desktop-only Topic banner */}
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
      {/* Topics options menu */}
      {/* idea is, between (Topic banner + side menu) and (Center menu), only one should show */}
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
          {/* Box that contains Q&A */}
          <Box flex="5">
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
            {/*Top row of "Questions" + 1 / 2 buttons*/}
            <Flex
              flexDir={{ base: 'column-reverse', sm: 'row' }}
              mb={5}
              justifyContent="space-between"
            >
              <Text
                color="primary.500"
                textStyle="subhead-3"
                mt={{ base: '32px', sm: 0 }}
                mb={{ sm: '20px' }}
                d="block"
              >
                {hasTopicsKey
                  ? topicQueryState
                    ? 'QUESTIONS ON THIS TOPIC'
                    : 'ALL QUESTIONS' // ALL QUESTIONS will never be shown. When do we want to show ALL QUESTIONS?
                  : 'TOP QUESTIONS'}
              </Text>
              {/* Dropdown stuff */}
              {/* Hidden for officer because of the subcomponents in officer dashboard */}
              {/* that requires different treatment */}
              <Stack
                spacing={{ base: 2, sm: 4 }}
                direction={{ base: 'column', md: 'row' }}
              >
                {/*<SortQuestionsMenu*/}
                {/*  questionsDisplayState={questionsDisplayState}*/}
                {/*  sortState={sortState}*/}
                {/*  setSortState={setSortState}*/}
                {/*/>*/}
                <Menu matchWidth autoSelect={false} offset={[0, 0]}>
                  {() => (
                    <>
                      <MenuButton
                        as={Button}
                        variant="outline"
                        borderColor="secondary.700"
                        color="secondary.700"
                        borderRadius="4px"
                        borderWidth="1px"
                        w={{ base: '100%', sm: '171px' }}
                        textStyle="body-1"
                        textAlign="left"
                        d={{ base: hasTopicsKey ? 'block' : 'none' }}
                      >
                        <Flex
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text textStyle="body-1">{sortState.label}</Text>
                          <BiSortAlt2 />
                        </Flex>
                      </MenuButton>
                      <MenuList
                        minW={0}
                        borderRadius={0}
                        borderWidth={0}
                        boxShadow="0px 0px 10px rgba(216, 222, 235, 0.5)"
                      >
                        {options.map(({ value, label }, i) => (
                          <MenuItem
                            key={i}
                            h="48px"
                            ps={4}
                            textStyle={
                              sortState.value === value ? 'subhead-1' : 'body-1'
                            }
                            fontWeight={
                              sortState.value === value ? '500' : 'normal'
                            }
                            letterSpacing="-0.011em"
                            bg={
                              sortState.value === value
                                ? 'primary.200'
                                : 'white'
                            }
                            _hover={
                              sortState.value === value
                                ? { bg: 'primary.200' }
                                : { bg: 'primary.100' }
                            }
                            onClick={() => {
                              setSortState(options[i])
                            }}
                          >
                            {label}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </>
                  )}
                </Menu>
                {isAuthenticatedOfficer && <PostQuestionButton />}
              </Stack>
            </Flex>
            {/* List of Posts depending on whether user is citizen or agency officer */}
            <QuestionsList
              sort={sortState.value}
              agencyId={agency?.id}
              topics={topicQueryState}
              questionsPerPage={
                isAuthenticatedOfficer ? 50 : hasTopicsKey ? 30 : 10
              }
              // questionsperPage={
              //   isAuthenticatedOfficer
              //     ? 50
              //     : questionsDisplayState.questionsPerPage
              // }
              listAnswerable={
                isAuthenticatedOfficer && user.agencyId === agency?.id
              }
              footerControl={
                // isAuthenticatedOfficer || questionsDisplayState.value === 'all' ? undefined : (
                isAuthenticatedOfficer || hasTopicsKey ? undefined : (
                  // View all questions button for citizen
                  <Button
                    mt={{ base: '40px', sm: '48px', xl: '58px' }}
                    variant="outline"
                    color="secondary.700"
                    borderColor="secondary.700"
                    onClick={() => {
                      window.scrollTo(0, 0)
                      navigate('?topics=')
                    }}
                  >
                    <Text textStyle="subhead-1">View all questions</Text>
                  </Button>
                )
              }
            />
          </Box>
        </Flex>
      </HStack>
      <Spacer />
      <CitizenRequest agency={agency} />
    </Flex>
  )
}

export default AgencyHomePage
