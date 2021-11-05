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
import { BiSortAlt2 } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import PageTitle from '../../components/PageTitle/PageTitle.component'
import PostQuestionButton from '../../components/PostQuestionButton/PostQuestionButton.component'
import QuestionsListComponent from '../../components/QuestionsList/QuestionsList.component'
import OptionsMenu from '../../components/OptionsMenu/OptionsMenu.component'
import { useAuth } from '../../contexts/AuthContext'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import {
  fetchTags,
  FETCH_TAGS_QUERY_KEY,
  getTagsUsedByAgency,
  GET_TAGS_USED_BY_AGENCY_QUERY_KEY,
} from '../../services/TagService'
import { isUserPublicOfficer } from '../../services/user.service'
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
      <Box flex="1">
        <OptionsMenu />
      </Box>
      <Flex
        maxW="680px"
        m="auto"
        w="100%"
        pt={{ base: '32px', sm: '80px', xl: '90px' }}
        px={8}
        direction={{ base: 'column', lg: 'row' }}
      >
        <Box flex="5">
          {(tags ?? [])
            .filter(({ tagname }) => tagname === queryState)
            .map((tag) => {
              return tag.description ? (
                <Text textStyle="body-1" color="neutral.900" mb="50px">
                  {tag.description}
                </Text>
              ) : null
            })}
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
              {hasTagsKey
                ? queryState
                  ? 'QUESTIONS ON THIS TOPIC'
                  : 'ALL QUESTIONS'
                : 'TOP QUESTIONS'}
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
                      borderColor="secondary.700"
                      color="secondary.700"
                      borderRadius="4px"
                      borderWidth="1px"
                      w={{ base: '100%', sm: '171px' }}
                      textStyle="body-1"
                      textAlign="left"
                      d={{ base: hasTagsKey ? 'block' : 'none' }}
                    >
                      <Flex justifyContent="space-between" alignItems="center">
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
          <QuestionsListComponent
            sort={sortState.value}
            agencyId={agency?.id}
            tags={queryState}
            pageSize={isAuthenticatedOfficer ? 50 : hasTagsKey ? 30 : 10}
            listAnswerable={isAuthenticatedOfficer}
            footerControl={
              isAuthenticatedOfficer || hasTagsKey ? undefined : (
                <Button
                  mt={{ base: '40px', sm: '48px', xl: '58px' }}
                  variant="outline"
                  color="secondary.700"
                  borderColor="secondary.700"
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
        </Box>
      </Flex>
      <Spacer />
      <CitizenRequest agency={agency} />
    </Flex>
  )
}

export default HomePage
