import { useContext } from 'react'
import { Flex, Stack, Text } from '@chakra-ui/react'

import { useAuth } from '../../contexts/AuthContext'
import { HomePageContext } from '../../contexts/HomePageContext'
import { isUserPublicOfficer } from '../../services/user.service'
import PostQuestionButton from '../PostQuestionButton/PostQuestionButton.component'
import { SortQuestionsMenu } from '../SortQuestionsMenu/SortQuestionsMenu.component'

export const QuestionsHeader = (): JSX.Element => {
  const { user } = useAuth()
  const isAuthenticatedOfficer = user !== null && isUserPublicOfficer(user)
  const { questionsDisplayState, questionsSortOrder, setQuestionsSortOrder } =
    useContext(HomePageContext)

  return (
    <Flex
      flexDir={{ base: 'column-reverse', sm: 'row' }}
      justifyContent="space-between"
    >
      <Text
        color="primary.500"
        textStyle="subhead-3"
        mt={{ base: '32px', sm: '50px', xl: '58px' }}
        mb={{ sm: '18px' }}
        d="block"
      >
        {questionsDisplayState.label}
      </Text>
      <Stack
        spacing={{ base: 2, sm: 4 }}
        direction={{ base: 'column', md: 'row' }}
      >
        <SortQuestionsMenu
          questionsDisplayState={questionsDisplayState}
          questionsSortOrder={questionsSortOrder}
          setQuestionsSortOrder={setQuestionsSortOrder}
        />
        {isAuthenticatedOfficer && <PostQuestionButton />}
      </Stack>
    </Flex>
  )
}
