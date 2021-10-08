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
import { BiSort } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { useLocation, useHistory, useParams } from 'react-router-dom'
import AgencyLogo from '../../components/AgencyLogo/AgencyLogo.component'
import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import OfficerDashboardComponent from '../../components/OfficerDashboard/OfficerDashboard.component'
import PageTitle from '../../components/PageTitle/PageTitle.component'
import PostQuestionButton from '../../components/PostQuestionButton/PostQuestionButton.component'
import QuestionsListComponent from '../../components/QuestionsList/QuestionsList.component'
import SearchBoxComponent from '../../components/SearchBox/SearchBox.component'
import TagPanel from '../../components/TagPanel/TagPanel.component'
import TagMenu from '../../components/TagMenu/TagMenu.component'
import { useAuth } from '../../contexts/AuthContext'
import {
  fetchTags,
  FETCH_TAGS_QUERY_KEY,
  getTagsUsedByAgency,
  GET_TAGS_USED_BY_AGENCY_QUERY_KEY,
} from '../../services/tag.service'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import { isUserPublicOfficer } from '../../services/user.service'
import { mergeTags } from '../../util/tagsmerger'
import { getTagsQuery, isSpecified } from '../../util/urlparser'

const HomePage = ({ match }) => {
  const [hasTagsKey, setHasTagsKey] = useState(false)
  const history = useHistory()
  // check URL
  const location = useLocation()
  // TODO (#259): make into custom hook
  useEffect(() => {
    setQueryState(getTagsQuery(location.search))
    const tagsSpecified = isSpecified(location.search, 'tags')
    setHasTagsKey(tagsSpecified)
  }, [location, hasTagsKey])

  const { user } = useAuth()

  const { agency: agencyShortName } = useParams()
  const { data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    { enabled: !!agencyShortName },
  )
  const { data: tags } = agency
    ? useQuery(GET_TAGS_USED_BY_AGENCY_QUERY_KEY, () =>
        getTagsUsedByAgency(agency.id),
      )
    : useQuery(FETCH_TAGS_QUERY_KEY, () => fetchTags())

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
          justifyContent="flex-start"
          className="home-search"
        >
          {/* TODO: might need to do some enforcing to ensure you can only */}
          {/* enter a single agency in the URL */}

          <Flex
            h="56px"
            m="auto"
            mt={
              agency
                ? { base: '20px', md: '56px' }
                : { base: '4px', xl: '56px' }
            }
            pt="!52px"
            px={agency ? { base: '24px', md: 'auto' } : 'auto'}
            maxW="680px"
            w="100%"
          >
            <SearchBoxComponent
              agencyShortName={match.params.agency || agency?.shortname}
            />
          </Flex>
        </Flex>
        {match.params.agency || agency ? (
          <Box px="36px" mt="-20px" display={{ base: 'none', lg: 'flex' }}>
            <AgencyLogo
              agencyShortName={match.params.agency || agency.shortname}
            />
          </Box>
        ) : null}
      </Box>
      <Box flex="1">{hasTagsKey ? <TagMenu /> : <TagPanel />}</Box>
      <Flex
        maxW="680px"
        m="auto"
        w="100%"
        pt={agency ? { base: '44px', md: '104px', xl: '80px' } : '44px'}
        px={{ base: 8 }}
        direction={{ base: 'column', lg: 'row' }}
      >
        <Box flex="5">
          {(tags ?? [])
            .filter(({ tagname }) => tagname === queryState)
            .map((tag) => {
              return (
                <Text textStyle="body-1" color="secondary.900" mb="50px">
                  {tag.description}
                </Text>
              )
            })}
          <Flex
            flexDir={{ base: 'column', sm: 'row' }}
            mb={5}
            justifyContent="space-between"
          >
            <Text
              color="secondary.500"
              textStyle="body-1"
              mb={{ base: '20px', sm: 0 }}
              mr={{ base: 0, sm: '20px' }}
              d={{ base: 'none', sm: 'block' }}
            >
              {queryState ? `Questions on this topic` : 'Top Questions'}
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
                      w={{ base: '100%', sm: '171px' }}
                      textStyle="body-1"
                      textAlign="left"
                      d={{ base: hasTagsKey ? 'block' : 'none' }}
                    >
                      <Flex justifyContent="space-between" alignItems="center">
                        <Text textStyle="body-1">{sortState.label}</Text>
                        <BiSort />
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
              pageSize={hasTagsKey ? 30 : 10}
              footerControl={
                hasTagsKey ? undefined : (
                  <Button
                    variant="outline"
                    color="primary.500"
                    borderColor="primary.500"
                    onClick={() => {
                      window.scrollTo(0, 0)
                      history.push('?tags=')
                    }}
                  >
                    <Text textStyle="subhead-1">View all questions</Text>
                  </Button>
                )
              }
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
