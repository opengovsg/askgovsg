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
import { useEffect, useRef } from 'react'

const PostList = ({ posts, defaultText, alertIfMoreThanDays, showViews }) => {
  const { agency: agencyShortName } = useParams()
  const { data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    { enabled: !!agencyShortName },
  )
  defaultText = defaultText ?? 'There are no posts to display.'

  const maxScroll = useRef(0)

  const googleAnalytics = useGoogleAnalytics()
  const updateMaxScroll = () => {
    maxScroll.current = Math.max(maxScroll.current, window.pageYOffset)
  }

  const sendMaxScrollToAnalytics = (maxScrollPossible) => {
    // The following is required to restrict the percentage to 100 due to browser compatibility issues:
    // https://stackoverflow.com/questions/17688595/finding-the-maximum-scroll-position-of-a-page
    maxScrollPossible = Math.max(maxScrollPossible, maxScroll.current)
    const maxScrollPercentage = Math.floor(
      (maxScroll.current / maxScrollPossible) * 100,
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
    window.addEventListener('scroll', updateMaxScroll)
  }
  const removeListenerAndSendEvent = (maxScrollPossible) => {
    window.removeEventListener('scroll', updateMaxScroll)
    if (maxScroll.current !== 0) sendMaxScrollToAnalytics(maxScrollPossible)
  }

  useEffect(() => {
    resetMaxScrollAndAddListener()
    // Due to browser compatibility issues, there is no single source of truth for maximum scroll height:
    // https://stackoverflow.com/questions/17688595/finding-the-maximum-scroll-position-of-a-page
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
