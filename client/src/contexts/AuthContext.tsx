import { AxiosError } from 'axios'
import { createContext, useContext, useEffect, useState } from 'react'
import { useMutation, UseMutationResult } from 'react-query'
import { User } from '~shared/types/base/user'
import { ApiClient } from '../api'
import * as AuthService from '../services/AuthService'
import { LoadUserDto } from '~shared/types/api'

interface AuthContextProps {
  user: User | null
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
  const [user, setUser] = useState<LoadUserDto>(null)

  const whoami = () => {
    ApiClient.get<LoadUserDto>('/auth')
      .then(({ data }) => {
        if (data) {
          setUser(data)
        }
      })
      .catch((reason: AxiosError) => {
        // Catch 400 or 401 which signals an unauthorized user, which is not an issue
        if (
          !(
            reason.response &&
            (reason.response.status === 401 || reason.response.status === 400)
          )
        ) {
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
    setUser(null)
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
