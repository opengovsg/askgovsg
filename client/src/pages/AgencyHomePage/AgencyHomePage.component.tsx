import { ReactNode } from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { Box, Flex, HStack, Spacer, Text, VStack } from '@chakra-ui/react'

import AgencyLogo from '../../components/AgencyLogo/AgencyLogo.component'
import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import OptionsMenu from '../../components/OptionsMenu/OptionsMenu.component'
import OptionsSideMenu from '../../components/OptionsMenu/OptionsSideMenu.component'
import TopicsMenu from '../../components/OptionsMenu/TopicsMenu.component'
import PageTitle from '../../components/PageTitle/PageTitle.component'
import { Questions } from '../../components/Questions/Questions.component'
import { useAuth } from '../../contexts/AuthContext'
import { useHomePageData } from '../../contexts/HomePageContext'
import { DeviceType, useDetectDevice } from '../../hooks/useDetectDevice'
import {
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
  getAgencyByShortName,
} from '../../services/AgencyService'
import {
  GET_TOPICS_USED_BY_AGENCY_QUERY_KEY,
  getTopicsUsedByAgency,
} from '../../services/TopicService'
import { isUserPublicOfficer } from '../../services/user.service'

const AgencyHomePage = (): JSX.Element => {
  const { questionsDisplayState, topicQueried, urlHasTopicsParamKey } =
    useHomePageData()

  const { user } = useAuth()
  const isAuthenticatedOfficer = user !== null && isUserPublicOfficer(user)

  const { agency: agencyShortName } = useParams()
  const { data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: `${agencyShortName}` }),
    { enabled: !!agencyShortName },
  )
  const { data: topics } = useQuery(
    GET_TOPICS_USED_BY_AGENCY_QUERY_KEY,
    () => getTopicsUsedByAgency(Number(agency?.id)),
    { enabled: !!agency },
  )

  // Designer: fair to assume user will almost always edit on desktop
  const deviceType = useDetectDevice()

  const bannerWithNeedHelpAndAgencyLogo = (
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
  )
  const topicBannerWithDescription = (
    <Flex bg="secondary.800" id="hero-landing-page-desktop">
      <Box ml="46px" pt="128px" position="absolute">
        {agency && <AgencyLogo agency={agency} />}
      </Box>
      <Flex maxW="680px" m="auto" w="100%" minH="224px">
        <VStack alignItems="flex-start" pt="64px">
          <Text textStyle="h2" color="white">
            {topicQueried}
          </Text>
          <Text>
            {topics
              ?.filter(({ name }) => name === topicQueried)
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
  )

  const topicsDescriptionAboveQuestions = topics
    ?.filter(({ name }) => name === topicQueried)
    .map((topic) => {
      return topic.description ? (
        <Text textStyle="body-1" color="neutral.900" pt={{ base: 8, sm: 10 }}>
          {topic.description}
        </Text>
      ) : null
    })

  const agencyQuestions = (
    <Questions
      agencyId={agency?.id}
      questionsPerPage={
        isAuthenticatedOfficer ? 50 : questionsDisplayState.questionsPerPage
      }
      showViewAllQuestionsButton={
        questionsDisplayState.value === 'top' && !isAuthenticatedOfficer
      }
      listAnswerable={isAuthenticatedOfficer && user?.agencyId === agency?.id}
    />
  )

  type WrapperProps = {
    children: ReactNode
  }
  const HStackWrapper = ({ children }: WrapperProps) => {
    return (
      <HStack
        id="main"
        alignItems="flex-start"
        display="grid"
        gridTemplateColumns={{
          base: '1fr',
          xl: urlHasTopicsParamKey && topicQueried ? '1fr 2fr 1fr' : '1fr',
        }}
      >
        {children}
      </HStack>
    )
  }

  const FlexWrapper = ({ children }: WrapperProps) => {
    return (
      <Flex
        id="questions"
        maxW="680px"
        m="auto"
        justifySelf="center"
        w="100%"
        px={{ base: 8, md: 0 }}
        direction={{ base: 'column', xl: 'row' }}
      >
        {children}
      </Flex>
    )
  }

  const homePageDefaultView = (
    <>
      {bannerWithNeedHelpAndAgencyLogo}
      <TopicsMenu agency={agency} />
      <HStackWrapper>
        <FlexWrapper>{agencyQuestions}</FlexWrapper>
      </HStackWrapper>
    </>
  )

  const homePageAllQuestionsView = (
    <>
      <OptionsMenu />
      <HStackWrapper>
        <FlexWrapper>{agencyQuestions}</FlexWrapper>
      </HStackWrapper>
    </>
  )

  const topicPageDesktopView = (
    <>
      {topicBannerWithDescription}
      <HStackWrapper>
        <OptionsSideMenu agency={agency} topics={topics} />
        <FlexWrapper>{agencyQuestions}</FlexWrapper>
      </HStackWrapper>
    </>
  )

  const topicPageMobileView = (
    <>
      <OptionsMenu />
      <FlexWrapper>
        {topicsDescriptionAboveQuestions}
        {agencyQuestions}
      </FlexWrapper>
    </>
  )

  return (
    <Flex direction="column" height="100%" id="home-page">
      <PageTitle
        title={`${agency?.shortname.toUpperCase()} FAQ - AskGov`}
        description={`Answers from ${
          agency?.longname
        } (${agency?.shortname.toUpperCase()})`}
      />
      {!urlHasTopicsParamKey
        ? homePageDefaultView // no topics param key -> default homepage
        : !topicQueried
        ? homePageAllQuestionsView // topics param key + no topic queried -> all questions
        : deviceType === DeviceType.Desktop // specific topic selected
        ? topicPageDesktopView
        : topicPageMobileView}
      <Spacer />
      <CitizenRequest agency={agency} />
    </Flex>
  )
}

export default AgencyHomePage
