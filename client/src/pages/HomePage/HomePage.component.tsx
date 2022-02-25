import { Flex, HStack, Spacer } from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import OptionsMenu from '../../components/OptionsMenu/OptionsMenu.component'
import {
  DEFAULT_QUESTIONS_DISPLAY_STATE,
  DEFAULT_QUESTIONS_SORT_STATE,
} from '../../components/Questions/questions'
import { Questions } from '../../components/Questions/Questions.component'

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
          <Questions
            questionsDisplayState={questionsDisplayState}
            setQuestionsDisplayState={setQuestionsDisplayState}
            sortState={sortState}
            setSortState={setSortState}
            isAuthenticatedOfficer={false}
            questionsPerPage={questionsDisplayState.questionsPerPage}
            navigate={navigate}
            showViewAllQuestionsButton={questionsDisplayState.value === 'all'}
          />
        </Flex>
      </HStack>
      <Spacer />
      <CitizenRequest />
    </Flex>
  )
}

export default HomePage
