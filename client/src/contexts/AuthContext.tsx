import React, { createContext, useContext, useEffect, useState } from 'react'
import { useMutation, UseMutationResult } from 'react-query'
import { ApiClient } from '../api'
import { useLocalStorage } from '../hooks/useLocalStorage'
import * as AuthService from '../services/AuthService'

interface AuthContextProps {
  user: unknown
  verifyOtp: UseMutationResult<
    { displayName: string; newParticipant: boolean; token: string },
    unknown,
    { email: string; otp: string }
  >
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
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [token, setToken] = useLocalStorage<string>('token')

  const whoami = () => {
    // TODO: type the response/user
    ApiClient.get<{ data: Record<string, unknown> } | null>('/auth')
      .then((res) => res.data?.data)
      .then((data) => {
        if (data) {
          setUser(data)
        }
      })
  }

  const setApiClientToken = (token?: string) => {
    if (token) {
      ApiClient.defaults.headers.common['x-auth-token'] = token
    } else {
      delete ApiClient.defaults.headers.common['x-auth-token']
    }
  }

  const verifyOtp = useMutation(AuthService.verifyOtp, {
    onSuccess: ({ token: receivedToken }) => {
      setToken(receivedToken)
      setApiClientToken(receivedToken)
      whoami()
    },
  })

  const logout = () => {
    setUser(null)
    setToken(undefined)
    setApiClientToken(undefined)
  }

  const auth = {
    user,
    verifyOtp,
    logout,
  }

  const initialize = () => {
    setApiClientToken(token)
    whoami()
  }

  useEffect(initialize, [])

  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}
