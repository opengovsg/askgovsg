import { HomePageProvider } from '../../contexts/HomePageContext'

import AgencyHomePage from './AgencyHomePage.component'

const AgencyHomePageWrapper = (): JSX.Element => {
  return (
    <HomePageProvider>
      <AgencyHomePage />
    </HomePageProvider>
  )
}

export default AgencyHomePageWrapper
