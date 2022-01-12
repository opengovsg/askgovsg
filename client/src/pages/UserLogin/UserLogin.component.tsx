import { Button, Center } from '@chakra-ui/react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const onClick = async () => {
  if (process.env.NODE_ENV === 'production') {
    window.location.href = `${process.env.PUBLIC_URL}/api/v1/auth/sgid/login`
  } else {
    window.location.href = 'http://localhost:6174/api/v1/auth/sgid/login'
  }
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
