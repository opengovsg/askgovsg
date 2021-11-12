import { AxiosError } from 'axios'
import { createContext, useContext, useEffect, useState } from 'react'
import { useMutation, UseMutationResult } from 'react-query'
import { ApiClient, getApiErrorMessage } from '../api'
import * as AuthService from '../services/AuthService'
import { LoadUserDto } from '~shared/types/api'
import { useStyledToast } from '../components/StyledToast/StyledToast'

interface AuthContextProps {
  user: LoadUserDto | null
  verifyOtp: UseMutationResult<void, unknown, { email: string; otp: string }>
  logout: () => void
}

const authContext = createContext<AuthContextProps | undefined>(undefined)

export const useAuth = (): AuthContextProps => {
  const auth = useContext(authContext)
  if (!auth) throw new Error('useAuth must be used within an AuthProvider')
  return auth
}

export const AuthProvider = ({
  children,
}: {
  children: JSX.Element
}): JSX.Element => {
  const toast = useStyledToast()
  const [user, setUser] = useState<LoadUserDto>(null)

  const whoami = () => {
    ApiClient.get<LoadUserDto>('/auth')
      .then(({ data }) => {
        if (data) {
          setUser(data)
        }
      })
      .catch((reason: AxiosError) => {
        // Catch 401 which signals an unauthorized user, which is not an issue
        if (!(reason.response?.status === 401)) {
          throw reason
        }
      })
  }

  const verifyOtp = useMutation(AuthService.verifyOtp, {
    onSuccess: () => {
      whoami()
    },
  })

  const logout = () => {
    ApiClient.post('/auth/logout')
      .then(() => {
        setUser(null)
      })
      .catch((error) => {
        toast({
          status: 'error',
          description: getApiErrorMessage(error),
        })
      })
  }

  const auth = {
    user,
    verifyOtp,
    logout,
  }

  const initialize = () => {
    whoami()
  }

  useEffect(initialize, [])

  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}
