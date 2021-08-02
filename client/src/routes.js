import React from 'react'
import { Switch, Route } from 'react-router-dom'
import withPageTitle from './services/withPageTitle'

import HomePage from './pages/HomePage/HomePage.component'
import SearchResults from './pages/SearchResults/SearchResults.component'
import Login from './pages/Login/Login.component'
import Post from './pages/Post/Post.component'
import PostForm from './pages/PostForm/PostForm.component'
import NotFound from './pages/NotFound/NotFound.component'
import EditForm from './pages/EditForm/EditForm.component'
import { CitizenTerms, AgencyTerms, Privacy } from './components/PrivacyTerms/'

const HomePageComponent = withPageTitle({
  component: HomePage,
  title: 'HelpGov',
})

const SearchResultsComponent = withPageTitle({
  component: SearchResults,
  title: 'All Questions - HelpGov',
})

const LoginComponent = withPageTitle({
  component: Login,
  title: 'Log In - HelpGov',
})

const PostFormComponent = withPageTitle({
  component: PostForm,
  title: 'Ask a Question - HelpGov',
})

const EditFormComponent = withPageTitle({
  component: EditForm,
  title: 'Edit Question - HelpGov',
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

const PrivacyComponent = withPageTitle({
  component: Privacy,
  title: 'Privacy',
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
      <Route exact path="/privacy" component={PrivacyComponent} />
      <Route path="*" component={NotFoundComponent} />
    </Switch>
  )
}

export default Routes
