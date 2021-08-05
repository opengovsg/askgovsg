import React from 'react'
import { Route, Switch } from 'react-router-dom'
import {
  AgencyPrivacy,
  AgencyTerms,
  CitizenPrivacy,
  CitizenTerms,
} from './components/PrivacyTerms/'
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
  title: 'AskGov',
})

const SearchResultsComponent = withPageTitle({
  component: SearchResults,
  title: 'All Questions - AskGov',
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

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={HomePageComponent} />
      <Route exact path="/agency/:agency" component={HomePageComponent} />
      <Route exact path="/questions" component={SearchResultsComponent} />
      <Route exact path="/login" component={LoginComponent} />
      <Route exact path="/questions/:id" component={PostComponent} />
      <Route exact path="/add/question" component={PostFormComponent} />
      <Route exact path="/edit/question/:id" component={EditFormComponent} />
      <Route exact path="/terms" component={CitizenTermsComponent} />
      <Route exact path="/agency-terms" component={AgencyTermsComponent} />
      <Route exact path="/privacy" component={CitizenPrivacyComponent} />
      <Route exact path="/agency-privacy" component={AgencyPrivacyComponent} />
      <Route path="*" component={NotFoundComponent} />
    </Switch>
  )
}

export default Routes
