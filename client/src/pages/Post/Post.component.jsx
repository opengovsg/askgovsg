import { Center, Flex, Spacer, Stack, Text, VStack } from '@chakra-ui/layout'
import { format, utcToZonedTime } from 'date-fns-tz'
import { useEffect, useRef } from 'react'
import { BiXCircle } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import sanitizeHtml from 'sanitize-html'
import { PostStatus, TagType } from '~shared/types/base'
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
import './Post.styles.scss'
import QuestionSection from './QuestionSection/QuestionSection.component'

const Post = () => {
  // Does not need to handle logic when public post with id postId is not found because this is handled by server
  const { id: postId } = useParams()
  const { isLoading: isPostLoading, data: post } = useQuery(
    [GET_POST_BY_ID_QUERY_KEY, postId],
    () => getPostById(postId, 3),
  )

  const agencyId = post?.agencyId
  const { isLoading: isAgencyLoading, data: agency } = useQuery(
    [GET_AGENCY_BY_ID_QUERY_KEY, agencyId],
    () => getAgencyById(agencyId),
    { enabled: !!agencyId },
  )

  const topicId = post?.topicId
  const { isLoading: isTopicLoading, data: topic } = useQuery(
    [GET_TOPIC_BY_ID_QUERY_KEY, topicId],
    () => getTopicById(topicId),
    { enabled: !!topicId },
  )

  // User can edit if it is authenticated whose agency tags intersect with
  // those found on posts
  const { user } = useAuth()

  const isAgencyMember = user && post && user.agencyId === post.agencyId

  const formattedTimeString = format(
    utcToZonedTime(post?.updatedAt ?? Date.now()),
    'dd MMM yyyy HH:mm, zzzz',
  )

  const { _, data: answers } = useQuery(
    [GET_ANSWERS_FOR_POST_QUERY_KEY, post?.id],
    () => getAnswersForPost(post?.id),
    { enabled: Boolean(post?.id) },
  )

  const breadcrumbContentRef = useRef([])

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
    <Spinner centerHeight="200px" />
  ) : (
    <Flex direction="column" height="100%">
      <PageTitle
        title={`${post.title} - ${
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
          maxW="1188px"
          px={{ base: '24px', sm: '88px' }}
          direction={{ base: 'column', lg: 'row' }}
          spacing={{ base: '20px', lg: '88px' }}
        >
          <div className="post-page">
            <Flex align="center">
              <Flex
                mt={{ base: '32px', sm: '60px' }}
                mb={{ base: '32px', sm: '50px' }}
              >
                {breadcrumbContentRef.current.length > 0 ? (
                  <NavBreadcrumb navOrder={breadcrumbContentRef.current} />
                ) : null}
              </Flex>
              <Spacer />
              {isAgencyMember && agency && (
                <div className="post-side-with-edit">
                  <EditButton
                    postId={postId}
                    onDeleteLink={`/agency/${agency.shortname}`}
                  />
                </div>
              )}
            </Flex>
            <Text textStyle="h2" color="secondary.800">
              {post.title}
            </Text>
            {post.status === PostStatus.Private ? (
              <div className="subtitle-bar">
                <div className="private-subtitle">
                  <BiXCircle
                    style={{ marginRight: '4px' }}
                    color="neutral.500"
                    size="24"
                  />
                  <span>
                    This question remains private until an answer is posted.
                  </span>
                </div>
              </div>
            ) : null}
            <div className="question-main">
              <QuestionSection post={post} />
              <AnswerSection answers={answers} />
              <div className="post-time">
                <time dateTime={formattedTimeString}>
                  Last updated {formattedTimeString}
                </time>
              </div>
            </div>
          </div>
          <VStack
            w={{ base: 'auto', lg: '240px' }}
            minW={{ base: 'auto', lg: '240px' }}
            pt={{ base: '36px', sm: '60px', lg: '152px' }}
            align="left"
            color="secondary.800"
          >
            <Text
              color="primary.500"
              mb={{ base: '16px', sm: '0px' }}
              textStyle="subhead-3"
            >
              Related Questions
            </Text>
            {post.relatedPosts.map((relatedPost) => (
              <Link to={`/questions/${relatedPost.id}`}>
                <Text
                  py={{ base: '24px', sm: '32px' }}
                  textStyle="subhead-2"
                  fontWeight="normal"
                  borderBottomWidth="1px"
                >
                  {relatedPost.title}
                </Text>
              </Link>
            ))}
          </VStack>
        </Stack>
      </Center>
      <Spacer />
      <CitizenRequest
        agency={
          agency
            ? agency
            : {
                id: '',
                email: 'enquiries@ask.gov.sg',
                shortname: 'AskGov',
                longname: 'AskGov',
                logo: '',
              }
        }
      />
    </Flex>
  )
}

export default Post
