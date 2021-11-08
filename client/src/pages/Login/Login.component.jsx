import { Spacer } from '@chakra-ui/react'
import { Navigate } from 'react-router-dom'
import AuthForm from '../../components/AuthForm/AuthForm.component'
import { useAuth } from '../../contexts/AuthContext'
import './Login.styles.scss'

const Login = () => {
  const { user } = useAuth()

  if (user) {
    return <Navigate replace to={`/agency/${user.agency.shortname}`} />
  } else {
    return (
      <div className="login-page">
        <Spacer h={['64px', '64px', '84px']} />
        <h2>AskGov</h2>
        <p>Answers from the Singapore Government</p>
        <AuthForm />
        <Spacer minH={20} />
      </div>
    )
  }
}

export default Login
