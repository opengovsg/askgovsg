import { Center, Flex, Spacer, Stack, Text, VStack } from '@chakra-ui/layout'
import { format, utcToZonedTime } from 'date-fns-tz'
import { BiXCircle } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import sanitizeHtml from 'sanitize-html'
import { PostStatus, TagType } from '~shared/types/base'
import { BackToHome } from '../../components/BackToHome/BackToHome'
import CitizenRequest from '../../components/CitizenRequest/CitizenRequest.component'
import EditButton from '../../components/EditButton/EditButton.component'
import PageTitle from '../../components/PageTitle/PageTitle.component'
import Spinner from '../../components/Spinner/Spinner.component'
import TagBadge from '../../components/TagBadge/TagBadge.component'
import { useAuth } from '../../contexts/AuthContext'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import {
  getAnswersForPost,
  GET_ANSWERS_FOR_POST_QUERY_KEY,
} from '../../services/AnswerService'
import {
  getPostById,
  GET_POST_BY_ID_QUERY_KEY,
} from '../../services/PostService'
import AnswerSection from './AnswerSection/AnswerSection.component'
import './Post.styles.scss'
import QuestionSection from './QuestionSection/QuestionSection.component'

const Post = () => {
  const { id: postId } = useParams()
  const { data: post, isLoading } = useQuery(
    [GET_POST_BY_ID_QUERY_KEY, postId],
    () => getPostById(postId, 3),
  )
  // Similar logic to find agency as login component
  // if post is linked to multiple agencies via agencyTag
  // take the first agencyTag found as agency for email component
  const firstAgencyTagLinkedToPost = post?.tags?.find(
    (tag) => tag.tagType === TagType.Agency,
  )
  //currently link agency tag to agency via tag.tagname to agency.shortname
  const agencyShortName = firstAgencyTagLinkedToPost?.tagname
  const { data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    { enabled: !!agencyShortName },
  )

  // User can edit if it is authenticated whose agency tags intersect with
  // those found on posts
  const { user } = useAuth()
  const hasCommonAgencyTags = (user, tagsFromPost) => {
    const { tags: userTags } = user
    const userAgencyTagNames = userTags
      .filter(({ tagType }) => tagType === TagType.Agency)
      .map((userTag) => userTag.tagname)
    const postAgencyTagNames = tagsFromPost
      .filter(({ tagType }) => tagType === TagType.Agency)
      .map((postTag) => postTag.tagname)
    const intersectingTagNames = userAgencyTagNames.filter((tagName) =>
      postAgencyTagNames.includes(tagName),
    )
    return intersectingTagNames.length > 0
  }

  const isAgencyMember =
    user && post?.tags && hasCommonAgencyTags(user, post?.tags)

  const formattedTimeString = format(
    utcToZonedTime(post?.updatedAt ?? Date.now()),
    'dd MMM yyyy HH:mm, zzzz',
  )

  const { _, data: answers } = useQuery(
    [GET_ANSWERS_FOR_POST_QUERY_KEY, post?.id],
    () => getAnswersForPost(post?.id),
  )

  return isLoading ? (
    <Spinner centerHeight="200px" />
  ) : (
    <Flex direction="column" height="100%">
      <PageTitle
        title={`${post.title} - ${agencyShortName?.toUpperCase()} FAQ - AskGov`}
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
          px="48px"
          direction={{ base: 'column', lg: 'row' }}
          spacing={{ base: '20px', lg: '88px' }}
        >
          <div className="post-page">
            <Flex align="center">
              <Flex
                mt={{ base: '32px', sm: '60px' }}
                mb={{ base: '32px', sm: '50px' }}
              >
                <BackToHome mainPageName={agencyShortName} />
              </Flex>
              <Spacer />
              {isAgencyMember && (
                <div className="post-side-with-edit">
                  <EditButton
                    postId={postId}
                    onDeleteLink={`/agency/${agencyShortName}`}
                  />
                </div>
              )}
            </Flex>
            <Text textStyle="h1" color="primary.500" pb="14px">
              {post.title}
            </Text>
            <div className="subtitle-bar">
              <div className="tags-name-time">
                <div className="post-tags">
                  {post.tags.map((tag, i) => {
                    return (
                      <TagBadge
                        key={i}
                        tagName={tag.tagname}
                        tagType={tag.tagType}
                        size={'s-tag'}
                        float={'left'}
                      />
                    )
                  })}
                </div>
              </div>
              {post.status === PostStatus.Private ? (
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
              ) : null}
            </div>
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
            pt={{ base: '0px', lg: '152px' }}
            px={{ base: '20px', lg: '0px' }}
            pb="40px"
            align="left"
            color="secondary.400"
          >
            <Text mb="8px" textStyle="subhead-3">
              Related
            </Text>
            {post.relatedPosts.map((relatedPost) => (
              <Link to={`/questions/${relatedPost.id}`}>
                <Text
                  mb="24px"
                  color="primary.900"
                  textStyle="subhead-2"
                  fontWeight="normal"
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
