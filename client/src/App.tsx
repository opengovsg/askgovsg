import { ChakraProvider } from '@chakra-ui/react'
import { Banner } from './components/Banner/Banner.component'
import Footer from './components/Footer/Footer.component'
import Header from './components/Header/Header.component'
import { AuthProvider } from './contexts/AuthContext'
import { GoogleAnalyticsProvider } from './contexts/googleAnalytics'
import { useFullstory } from './hooks/useFullstory'
import Routes from './routes'
import { theme } from './theme'

const App = (): JSX.Element => {
  useFullstory()

  return (
    <GoogleAnalyticsProvider>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <>
            <Banner />
            <Header />
            <Routes />
            <Footer />
          </>
        </AuthProvider>
      </ChakraProvider>
    </GoogleAnalyticsProvider>
  )
}

export default App
