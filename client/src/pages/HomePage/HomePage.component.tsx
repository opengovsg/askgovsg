import { Flex, HStack, Spacer } from '@chakra-ui/react'

import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import OptionsMenu from '../../components/OptionsMenu/OptionsMenu.component'
import { Questions } from '../../components/Questions/Questions.component'

const HomePage = (): JSX.Element => {
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
          pt={{ sm: '30px', xl: '22px' }}
          px={{ base: 8, md: 0 }}
          direction={{ base: 'column', lg: 'row' }}
        >
          <Questions />
        </Flex>
      </HStack>
      <Spacer />
      <CitizenRequest />
    </Flex>
  )
}

export default HomePage
