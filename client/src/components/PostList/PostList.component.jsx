import PostItem from '../../components/PostItem/PostItem.component'

import { Text } from '@chakra-ui/react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import * as FullStory from '@fullstory/browser'
import { useEffect } from 'react'

const PostList = ({ posts, defaultText, alertIfMoreThanDays, showViews }) => {
  const { agency: agencyShortName } = useParams()
  const { data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    { enabled: !!agencyShortName },
  )
  defaultText = defaultText ?? 'There are no posts to display.'

  const googleAnalytics = useGoogleAnalytics()
  const updateMaxScroll = () => {
    googleAnalytics.maxScroll = Math.max(
      googleAnalytics.maxScroll,
      window.pageYOffset,
    )
  }

  const sendMaxScrollToAnalytics = (maxScrollPossible) => {
    maxScrollPossible = Math.max(maxScrollPossible, googleAnalytics.maxScroll) // this is required to restrict the percentage to 100
    const maxScrollPercentage = Math.floor(
      (googleAnalytics.maxScroll / maxScrollPossible) * 100,
    )
    googleAnalytics.sendUserEvent(
      googleAnalytics.GA_USER_EVENTS.BROWSE,
      agencyShortName,
      maxScrollPercentage,
    )
    FullStory.event(googleAnalytics.GA_USER_EVENTS.BROWSE, {
      agencyName_str: agencyShortName,
      maxScroll_int: maxScrollPercentage,
    })
  }

  const resetMaxScrollAndAddListener = () => {
    googleAnalytics.maxScroll = 0
    window.addEventListener('scroll', updateMaxScroll)
  }
  const removeListenerAndSendEvent = (maxScrollPossible) => {
    window.removeEventListener('scroll', updateMaxScroll)
    if (googleAnalytics.maxScroll !== 0)
      sendMaxScrollToAnalytics(maxScrollPossible)
  }

  useEffect(() => {
    resetMaxScrollAndAddListener()
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
    )
    const maxScrollPossible = pageHeight - window.innerHeight
    return () => removeListenerAndSendEvent(maxScrollPossible)
  }, [])

  return (
    <div className="post-list">
      {posts && posts.length > 0 ? (
        <div className="questions">
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              alertIfMoreThanDays={alertIfMoreThanDays}
              showViews={showViews}
              agency={agency}
            />
          ))}
        </div>
      ) : (
        <Text color="secondary.500" textStyle="h4" py={4}>
          {defaultText}
        </Text>
      )}
    </div>
  )
}

export default PostList
