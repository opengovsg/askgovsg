import { Box, Spacer, Text } from '@chakra-ui/react'
import { Navigate } from 'react-router-dom'
import AuthForm from '../../components/AuthForm/AuthForm.component'
import { useAuth } from '../../contexts/AuthContext'

const Login = (): JSX.Element => {
  const { user } = useAuth()

  if (user) {
    return <Navigate replace to={`/agency/${user.agency.shortname}`} />
  } else {
    return (
      <Box
        mt="48px"
        px={{ base: '36px', xs: '48px' }}
        mx="auto"
        maxW="calc(320px + 48px * 2)"
        className="login-page"
      >
        <Spacer h={['64px', '64px', '84px']} />
        <Text textStyle="display-2" mb="8px">
          AskGov
        </Text>
        <Text textStyle="body-1">Answers from the Singapore Government</Text>
        <AuthForm />
        <Spacer minH={20} />
      </Box>
    )
  }
}

export default Login
