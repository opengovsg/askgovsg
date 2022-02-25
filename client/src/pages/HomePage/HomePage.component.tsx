import {
  Box,
  Button,
  Flex,
  HStack,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import QuestionsList from '../../components/QuestionsList/QuestionsList.component'
import OptionsMenu from '../../components/OptionsMenu/OptionsMenu.component'
import {
  DEFAULT_QUESTIONS_DISPLAY_STATE,
  DEFAULT_QUESTIONS_SORT_STATE,
  QuestionsDisplayState,
  questionsDisplayStates,
} from '../../components/Questions/questions'
import { QuestionsListHeader } from '../../components/QuestionsListHeader/QuestionsListHeader.component'

const HomePage = (): JSX.Element => {
  const [questionsDisplayState, setQuestionsDisplayState] = useState(
    DEFAULT_QUESTIONS_DISPLAY_STATE,
  )
  const [sortState, setSortState] = useState(DEFAULT_QUESTIONS_SORT_STATE)
  const navigate = useNavigate()

  return (
    <Flex direction="column" height="100%" id="home-page">
      <OptionsMenu />
      <HStack
        id="main"
        alignItems="flex-start"
        display="grid"
        gridTemplateColumns={{
          base: '1fr',
          xl: '1fr',
        }}
      >
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
          {/* Questions */}
          <Box flex="5">
            <QuestionsListHeader
              questionsDisplayState={questionsDisplayState}
              sortState={sortState}
              setSortState={setSortState}
              isAuthenticatedOfficer={false}
            />
            {/* List of Posts depending on whether user is citizen or agency officer */}
            <QuestionsList
              sort={sortState.value}
              questionsPerPage={questionsDisplayState.questionsPerPage}
              footerControl={
                questionsDisplayState.value === 'all' ? undefined : (
                  // View all questions button for citizen
                  <Button
                    mt={{ base: '40px', sm: '48px', xl: '58px' }}
                    variant="outline"
                    color="secondary.700"
                    borderColor="secondary.700"
                    onClick={() => {
                      window.scrollTo(0, 0)
                      navigate('?topics=')
                      setQuestionsDisplayState(
                        questionsDisplayStates.find(
                          (state) => state.value === 'all',
                        ) as QuestionsDisplayState,
                      )
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
      <CitizenRequest />
    </Flex>
  )
}

export default HomePage
