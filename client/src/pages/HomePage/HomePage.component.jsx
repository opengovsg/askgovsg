import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { BiChevronDown, BiChevronUp } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { useLocation, useParams } from 'react-router-dom'
import AgencyLogo from '../../components/AgencyLogo/AgencyLogo.component'
import { BackToHome } from '../../components/BackToHome/BackToHome'
import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import OfficerDashboardComponent from '../../components/OfficerDashboard/OfficerDashboard.component'
import PageTitle from '../../components/PageTitle/PageTitle.component'
import PostQuestionButton from '../../components/PostQuestionButton/PostQuestionButton.component'
import QuestionsListComponent from '../../components/QuestionsList/QuestionsList.component'
import SearchBoxComponent from '../../components/SearchBox/SearchBox.component'
import TagPanel from '../../components/TagPanel/TagPanel.component'
import { useAuth } from '../../contexts/AuthContext'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import { isUserPublicOfficer } from '../../services/user.service'
import { mergeTags } from '../../util/tagsmerger'
import { getTagsQuery } from '../../util/urlparser'

const HomePage = ({ match }) => {
  // check URL
  const location = useLocation()
  // TODO (#259): make into custom hook
  useEffect(() => {
    setQueryState(getTagsQuery(location.search))
  }, [location])

  const { user } = useAuth()

  const { agency: agencyShortName } = useParams()
  const { data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    { enabled: !!agencyShortName },
  )

  // dropdown options
  const options = [
    { value: 'basic', label: 'Most recent' },
    { value: 'top', label: 'Popular' },
  ]
  // dropdown state, default popular
  const [sortState, setSortState] = useState(options[1])
  const [queryState, setQueryState] = useState('')

  const agencyAndTags = mergeTags(match.params.agency, queryState)
  const isAuthenticatedOfficer = isUserPublicOfficer(user)

  return (
    <Flex direction="column" height="100%" className="home-page">
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
      <Box
        bg="primary.500"
        h={
          agency
            ? { base: '120px', md: '176px' }
            : { base: '120px', xl: '176px' }
        }
        className="top-background"
      >
        <Flex
          direction="row"
          mx="auto"
          px={{ base: '32px', md: '48px' }}
          maxW="1504px"
          justifyContent="space-between"
          className="home-search"
        >
          {/* TODO: might need to do some enforcing to ensure you can only */}
          {/* enter a single agency in the URL */}

          {match.params.agency || agency ? (
            <Flex
              flex="1"
              mt="56px"
              mr={{ base: '48px', xl: '88px' }}
              display={{ base: 'none', md: 'flex' }}
            >
              <AgencyLogo
                agencyShortName={match.params.agency || agency.shortname}
              />
            </Flex>
          ) : null}

          <Box
            flex="5"
            h="58px"
            mt={
              agency
                ? { base: '20px', md: '56px' }
                : { base: '4px', xl: '56px' }
            }
            mx={agency ? 0 : 'auto'}
            maxW={{ base: '100%', xl: '80%' }}
          >
            <SearchBoxComponent
              agencyShortName={match.params.agency || agency?.shortname}
            />
          </Box>
        </Flex>
      </Box>
      <Flex
        maxW="1504px"
        m="auto"
        w="100vw"
        pt={agency ? { base: '44px', md: '104px', xl: '80px' } : '44px'}
        px={{ base: 8, md: 12 }}
        direction={{ base: 'column', lg: 'row' }}
      >
        <Box
          flex="1"
          mr={{ lg: '3vw' }}
          mb="10"
          d={{ base: queryState ? 'none' : 'block', lg: 'block' }}
        >
          <TagPanel />
        </Box>
        <Box flex="5">
          {queryState ? (
            <Flex mb={{ base: '32px', sm: '50px' }}>
              <BackToHome
                mainPageName={match.params.agency || agency?.shortname}
              />
            </Flex>
          ) : null}
          <Flex
            flexDir={{ base: 'column', sm: 'row' }}
            mb={5}
            justifyContent="space-between"
          >
            <Text
              color="primary.800"
              textStyle="h1"
              mb={{ base: '20px', sm: 0 }}
              mr={{ base: 0, sm: '20px' }}
            >
              {queryState
                ? `Questions related to: ${queryState}`
                : 'All Questions'}
            </Text>
            {/* Dropdown stuff */}
            {/* Hidden for officer because of the subcomponents in officer dashboard */}
            {/* that requires different treatment */}
            <Stack
              spacing={{ base: 2, sm: 4 }}
              direction={{ base: 'column', md: 'row' }}
            >
              <Menu matchWidth autoSelect={false} offset={0}>
                {({ isOpen }) => (
                  <>
                    <MenuButton
                      as={Button}
                      variant="outline"
                      borderColor="secondary.500"
                      color="secondary.500"
                      borderRadius="4px"
                      borderWidth="1px"
                      w={{ base: '100%', sm: '168px' }}
                      textStyle="subhead-1"
                      textAlign="left"
                      rightIcon={
                        isOpen ? (
                          <Box h="20px" textColor="secondary.500">
                            <BiChevronUp size="16" />
                          </Box>
                        ) : (
                          <Box h="20px" textColor="secondary.500">
                            <BiChevronDown size="16" />
                          </Box>
                        )
                      }
                    >
                      {sortState.label}
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
                            sortState.value === value ? 'primary.200' : 'white'
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
          {isAuthenticatedOfficer ? (
            <OfficerDashboardComponent
              sort={sortState.value}
              tags={agencyAndTags}
              pageSize={50}
            />
          ) : (
            <QuestionsListComponent
              sort={sortState.value}
              agency={match.params.agency}
              tags={queryState}
              pageSize={30}
            />
          )}
        </Box>
      </Flex>
      <Spacer />
      <CitizenRequest agency={agency} />
    </Flex>
  )
}

export default HomePage
