import { Route, Routes as ReactRoutes } from 'react-router-dom'

import {
  AgencyPrivacy,
  AgencyTerms,
  CitizenPrivacy,
  CitizenTerms,
} from './components/PrivacyTerms'
import AgencyHomePage from './pages/AgencyHomePage/AgencyHomePage.component'
import EditForm from './pages/EditForm/EditForm.component'
import HomePage from './pages/HomePage/HomePage.component'
import Login from './pages/Login/Login.component'
import NotFound from './pages/NotFound/NotFound.component'
import Post from './pages/Post/Post.component'
import PostForm from './pages/PostForm/PostForm.component'
import SearchResults from './pages/SearchResults/SearchResults.component'
import withPageTitle from './services/withPageTitle'

const HomePageComponent = withPageTitle({
  component: HomePage,
})

const AgencyHomePageComponent = withPageTitle({
  component: AgencyHomePage,
})

const SearchResultsComponent = withPageTitle({
  component: SearchResults,
  title: 'Search Results - AskGov',
})

const LoginComponent = withPageTitle({
  component: Login,
  title: 'Log In - AskGov',
})

const PostFormComponent = withPageTitle({
  component: PostForm,
  title: 'Ask a Question - AskGov',
})

const EditFormComponent = withPageTitle({
  component: EditForm,
  title: 'Edit Question - AskGov',
})

const NotFoundComponent = withPageTitle({
  component: NotFound,
  title: 'Error 404',
})

const PostComponent = withPageTitle({
  component: Post,
})

const CitizenTermsComponent = withPageTitle({
  component: CitizenTerms,
  title: 'Terms of Use',
})

const AgencyTermsComponent = withPageTitle({
  component: AgencyTerms,
  title: 'Terms of Use (Agency)',
})

const CitizenPrivacyComponent = withPageTitle({
  component: CitizenPrivacy,
  title: 'Privacy',
})

const AgencyPrivacyComponent = withPageTitle({
  component: AgencyPrivacy,
  title: 'Privacy (Agency)',
})

const Routes = (): JSX.Element => {
  return (
    <ReactRoutes>
      <Route path="/" element={<HomePageComponent />} />
      <Route path="/agency/:agency" element={<AgencyHomePageComponent />} />
      <Route path="/questions" element={<SearchResultsComponent />} />
      <Route path="/login" element={<LoginComponent />} />
      <Route path="/questions/:id" element={<PostComponent />} />
      <Route path="/add/question" element={<PostFormComponent />} />
      <Route path="/edit/question/:id" element={<EditFormComponent />} />
      <Route path="/terms" element={<CitizenTermsComponent />} />
      <Route path="/agency-terms" element={<AgencyTermsComponent />} />
      <Route path="/privacy" element={<CitizenPrivacyComponent />} />
      <Route path="/agency-privacy" element={<AgencyPrivacyComponent />} />
      <Route path="*" element={<NotFoundComponent />} />
    </ReactRoutes>
  )
}

export default Routes
