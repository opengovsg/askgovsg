import { ChakraProvider } from '@chakra-ui/react'
import React from 'react'
import './App.css'
import { Banner } from './components/Banner/Banner.component'
import Footer from './components/Footer/Footer.component'
import Header from './components/Header/Header.component'
import Masthead from './components/Masthead/Masthead.component'
import { AuthProvider } from './contexts/AuthContext'
import { GoogleAnalyticsProvider } from './contexts/googleAnalytics'
import { useFullstory } from './hooks/useFullstory'
import Routes from './routes'
import { theme } from './theme'

const App = () => {
  useFullstory()

  return (
    <GoogleAnalyticsProvider>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <div className="App">
            <Masthead />
            <Banner />
            <Header />
            <div className="main-content">
              <Routes />
            </div>
            <Footer />
          </div>
        </AuthProvider>
      </ChakraProvider>
    </GoogleAnalyticsProvider>
  )
}

export default App
