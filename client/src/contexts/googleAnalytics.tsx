import { FC, createContext, useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useEnvironment } from '../hooks/useEnvironment'
import { GoogleAnalyticsService } from '../services/googleAnalytics'

const {
  GA_USER_EVENTS,
  initializeGA,
  setGAUserId,
  sendPageView,
  sendUserEvent,
  sendTiming,
  sendException,
  appLoadTime,
  hasSearched,
} = GoogleAnalyticsService

type GoogleAnalyticsContextProps = Omit<
  typeof GoogleAnalyticsService,
  'initializeGA'
>

export const GoogleAnalyticsContext = createContext<
  GoogleAnalyticsContextProps | undefined
>(undefined)

export const useGoogleAnalytics = (): GoogleAnalyticsContextProps => {
  const GoogleAnalytics = useContext(GoogleAnalyticsContext)
  if (!GoogleAnalytics)
    throw new Error(
      'useGoogleAnalytics must be used within an GoogleAnalyticsProvider',
    )
  return GoogleAnalytics
}

export const GoogleAnalyticsProvider: FC = ({ children }) => {
  const location = useLocation()
  const { data, isSuccess } = useEnvironment()

  useEffect(() => {
    if (isSuccess && data) initializeGA(data.googleAnalyticsId)
  }, [isSuccess, data])

  // when route changes, send page view to GA
  useEffect(() => {
    if (isSuccess) sendPageView(location.pathname)
  }, [location, isSuccess])

  const ga = {
    GA_USER_EVENTS,
    setGAUserId,
    sendPageView,
    sendUserEvent,
    sendTiming,
    sendException,
    appLoadTime,
    hasSearched,
  }

  return (
    <GoogleAnalyticsContext.Provider value={ga}>
      {children}
    </GoogleAnalyticsContext.Provider>
  )
}
