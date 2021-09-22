import { Box, Center, Flex, Spacer, Text, IconButton } from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { BiChevronDown } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import AgencyLogo from '../../components/AgencyLogo/AgencyLogo.component'
import SearchBoxComponent from '../../components/SearchBox/SearchBox.component'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'

const FullScreenSearch = ({ agencyParam, scrollToAnchor }) => {
  const { agency: agencyShortName } = useParams()
  const { data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    { enabled: !!agencyShortName },
  )

  const mobileSearchHeightRef = useRef('100vh')
  const [agencyState, setAgencyState] = useState(agencyParam)

  useEffect(() => {
    mobileSearchHeightRef.current =
      'calc(100vh - ' +
      document.getElementById('mobile-search').getBoundingClientRect().top +
      'px - ' +
      window.scrollY +
      'px)'
  }, [])
  useEffect(() => {
    setAgencyState(agency)
  }, [agency])
  const scrollToQuestions = () => {
    const questionsView = document.getElementById(scrollToAnchor)
    questionsView.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <Box id="mobile-search" height={mobileSearchHeightRef.current}>
      <Flex direction="column" height="100%">
        <Spacer />
        <Flex direction="column" height="80%">
          <Spacer />
          <Center>
            <Box w="85%">
              {agencyState ? (
                <Flex direction="column">
                  <AgencyLogo agencyShortName={agencyState.shortname} />
                  <Spacer />
                  <Text py="10px" textStyle="h1-mobile">
                    {agencyState.longname}
                  </Text>
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
                  agencyShortName={agencyState?.shortname}
                  inputVariant="filled"
                />
              </Box>
              <Text py="20px" textStyle="body-2">
                Common topics include [top category 1], [top category 2], [top
                category 3]
              </Text>
            </Box>
          </Center>
          <Spacer />
        </Flex>
        <Spacer />
        <Center>
          <IconButton
            aria-label="Search database"
            variant="ghost"
            isRound
            icon={<BiChevronDown size="sm" color="grey" />}
            onClick={scrollToQuestions}
          />
        </Center>
        <Spacer />
      </Flex>
    </Box>
  )
}

export default FullScreenSearch
