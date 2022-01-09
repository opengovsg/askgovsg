import { Button, Center } from '@chakra-ui/react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ApiClient } from '../../api'

const onClick = async () => {
  const response = await ApiClient.get('/auth/sgid/login')
  window.location.href = response.request.responseURL
}

const UserLogin = (): JSX.Element => {
  const { user } = useAuth()

  if (user) {
    return <Navigate replace to={`/`} />
  }

  return (
    <Center>
      <Button
        backgroundColor="secondary.700"
        _hover={{
          background: 'secondary.600',
        }}
        borderRadius="4px"
        color="white"
        onClick={onClick}
      >
        Login using SingPass
      </Button>
    </Center>
  )
}

export default UserLogin
