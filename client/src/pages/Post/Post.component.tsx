import {
  Box,
  Center,
  Flex,
  Spacer,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/layout'
import { useMultiStyleConfig } from '@chakra-ui/system'
import { format, utcToZonedTime } from 'date-fns-tz'
import { useEffect, useRef } from 'react'
import { BiXCircle } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import sanitizeHtml from 'sanitize-html'
import { PostStatus } from '~shared/types/base'
import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import EditButton from '../../components/EditButton/EditButton.component'
import { NavBreadcrumb } from '../../components/NavBreadcrumb/NavBreadcrumb'
import PageTitle from '../../components/PageTitle/PageTitle.component'
import Spinner from '../../components/Spinner/Spinner.component'
import { useAuth } from '../../contexts/AuthContext'
import {
  getAgencyById,
  GET_AGENCY_BY_ID_QUERY_KEY,
} from '../../services/AgencyService'
import {
  getAnswersForPost,
  GET_ANSWERS_FOR_POST_QUERY_KEY,
} from '../../services/AnswerService'
import {
  getPostById,
  GET_POST_BY_ID_QUERY_KEY,
} from '../../services/PostService'
import {
  getTopicById,
  GET_TOPIC_BY_ID_QUERY_KEY,
} from '../../services/TopicService'
import AnswerSection from './AnswerSection/AnswerSection.component'
import QuestionSection from './QuestionSection/QuestionSection.component'

const Post = (): JSX.Element => {
  const styles = useMultiStyleConfig('Post', {})
  // Does not need to handle logic when public post with id postId is not found because this is handled by server
  const { id: postId } = useParams()
  const { isLoading: isPostLoading, data: post } = useQuery(
    [GET_POST_BY_ID_QUERY_KEY, postId],
    () => getPostById(Number(postId), 3),
    { enabled: !!postId },
  )

  const agencyId = post?.agencyId
  const { isLoading: isAgencyLoading, data: agency } = useQuery(
    [GET_AGENCY_BY_ID_QUERY_KEY, agencyId],
    () => getAgencyById(Number(agencyId)),
    { enabled: !!agencyId },
  )

  const topicId = post?.topicId
  const { isLoading: isTopicLoading, data: topic } = useQuery(
    [GET_TOPIC_BY_ID_QUERY_KEY, topicId],
    () => getTopicById(Number(topicId)),
    { enabled: !!topicId },
  )

  // User can edit if it is authenticated whose agency tags intersect with
  // those found on posts
  const { user } = useAuth()

  const isAgencyMember = user && post && user.agencyId === post.agencyId

  const formattedTimeString = format(
    utcToZonedTime(post?.updatedAt ?? Date.now(), 'Asia/Singapore'),
    'dd MMM yyyy HH:mm, zzzz',
  )

  const { data: answers } = useQuery(
    [GET_ANSWERS_FOR_POST_QUERY_KEY, post?.id],
    () => getAnswersForPost(Number(post?.id)),
    { enabled: Boolean(post?.id) },
  )

  const breadcrumbContentRef = useRef<{ text: string; link: string }[]>([])

  useEffect(() => {
    if (post) {
      let foundAgency = undefined
      let foundTopic = undefined

      if (agency) {
        foundAgency = {
          text: agency.shortname.toUpperCase(),
          link: `/agency/${agency.shortname}`,
        }
      }
      if (topic && agency) {
        foundTopic = {
          text: topic.name,
          link: `/agency/${agency.shortname}?topics=${topic.name}`,
        }
      }
      breadcrumbContentRef.current = []
      if (foundAgency) breadcrumbContentRef.current.push(foundAgency)
      if (foundTopic) breadcrumbContentRef.current.push(foundTopic)
    }
  })

  const isLoading = isPostLoading || isAgencyLoading || isTopicLoading

  return isLoading ? (
    <Spinner centerHeight={`${styles.spinner.height}`} />
  ) : (
    <Flex direction="column" sx={styles.container}>
      <PageTitle
        title={`${post?.title} - ${
          agency && agency.shortname.toUpperCase()
        } FAQ - AskGov`}
        description={
          answers && answers.length > 0
            ? sanitizeHtml(
                answers[0]?.body,
                {
                  allowedTags: [],
                  allowedAttributes: {},
                }, // remove ALL html tags
              )
            : undefined
        }
      />
      <Center>
        <Stack
          spacing={{ base: '20px', lg: '88px' }}
          direction={{ base: 'column', lg: 'row' }}
          sx={styles.content}
        >
          <Box className="post-page">
            <Flex align="center">
              <Flex sx={styles.breadcrumb}>
                {breadcrumbContentRef.current.length > 0 ? (
                  <NavBreadcrumb navOrder={breadcrumbContentRef.current} />
                ) : null}
              </Flex>
              <Spacer />
              {isAgencyMember && agency && (
                <EditButton
                  postId={Number(postId)}
                  onDeleteLink={`/agency/${agency.shortname}`}
                />
              )}
            </Flex>
            <Text sx={styles.title}>{post?.title}</Text>
            {post?.status === PostStatus.Private ? (
              <Box sx={styles.subtitle} className="subtitle-bar">
                <Flex sx={styles.private}>
                  <BiXCircle
                    style={{
                      marginRight: `${styles.privateIcon.marginRight}`,
                      color: `${styles.privateIcon.color}`,
                    }}
                    size={`${styles.privateIcon.fontSize}`}
                  />
                  <Box as="span">
                    This question remains private until an answer is posted.
                  </Box>
                </Flex>
              </Box>
            ) : null}
            <QuestionSection post={post} />
            <AnswerSection answers={answers} />
            <Box sx={styles.lastUpdated}>
              <time dateTime={formattedTimeString}>
                Last updated {formattedTimeString}
              </time>
            </Box>
          </Box>
          <VStack sx={styles.relatedSection} align="left">
            <Text sx={styles.relatedHeading}>Related Questions</Text>
            {post?.relatedPosts.map((relatedPost) => (
              <Link to={`/questions/${relatedPost.id}`}>
                <Text sx={styles.relatedLink}>{relatedPost.title}</Text>
              </Link>
            ))}
          </VStack>
        </Stack>
      </Center>
      <Spacer />
      <CitizenRequest agency={agency} />
    </Flex>
  )
}

export default Post
