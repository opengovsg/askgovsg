import { Box, Spacer, useMultiStyleConfig } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Navigate, useParams, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../api'
import Spinner from '../../components/Spinner/Spinner.component'
import { useAuth } from '../../contexts/AuthContext'
import {
  getAnswersForPost,
  GET_ANSWERS_FOR_POST_QUERY_KEY,
  updateAnswer,
} from '../../services/AnswerService'
import * as PostService from '../../services/PostService'
import {
  GET_POST_BY_ID_QUERY_KEY,
  LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY,
  LIST_POSTS_QUERY_KEY,
} from '../../services/PostService'
import {
  getTopicsUsedByAgency,
  GET_TOPICS_USED_BY_AGENCY_QUERY_KEY,
} from '../../services/TopicService'
import AskForm, {
  AskFormSubmission,
} from '../PostForm/AskForm/AskForm.component'
import { useStyledToast } from '../../components/StyledToast/StyledToast'

const EditForm = (): JSX.Element => {
  const { user } = useAuth()
  const styles = useMultiStyleConfig('AdminForm', {})
  const queryclient = useQueryClient()
  const navigate = useNavigate()
  const { id } = useParams<'id'>()
  const postId = Number(id)

  if (!user) {
    return <Navigate replace to="/login" />
  } else {
    const getPostQueryKey = useMemo(
      () => [GET_POST_BY_ID_QUERY_KEY, postId],
      [postId],
    )
    const getAnswerQueryKey = useMemo(
      () => [GET_ANSWERS_FOR_POST_QUERY_KEY, postId],
      [postId],
    )
    const toast = useStyledToast()
    const { isLoading: isPostLoading, data: postData } = useQuery(
      getPostQueryKey,
      () => PostService.getPostById(postId),
    )
    const { isLoading: isAnswerLoading, data: answerData } = useQuery(
      getAnswerQueryKey,
      () => getAnswersForPost(postId),
    )
    const { isLoading: isTopicLoading, data: topicData } = useQuery(
      GET_TOPICS_USED_BY_AGENCY_QUERY_KEY,
      () => getTopicsUsedByAgency(user.agencyId),
      {
        staleTime: Infinity,
      },
    )
    const topicId = Number(postData?.topicId)
    const postTopic = topicData?.filter((topic) => topic.id === topicId)

    const updatePostAndAnswer = async (data: AskFormSubmission) => {
      if (!answerData) {
        toast({
          status: 'error',
          description: getApiErrorMessage(),
        })
        return
      }

      await PostService.updatePost(postId, {
        description: data.postData.description,
        title: data.postData.title,
        agencyId: user.agencyId,
        tagname: null, //TODO: Update when tags are re-introduced
        topicId: data.topic,
      })

      await updateAnswer(answerData[0].id, data.answerData)
    }
    const updatePostAndAnswerMutation = useMutation(updatePostAndAnswer, {
      onSuccess: () => {
        queryclient.invalidateQueries(getPostQueryKey)
        queryclient.invalidateQueries(getAnswerQueryKey)
        queryclient.invalidateQueries(LIST_POSTS_QUERY_KEY)
        queryclient.invalidateQueries(
          LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY,
        )
      },
    })

    const onSubmit = async (data: AskFormSubmission) => {
      try {
        await updatePostAndAnswerMutation.mutateAsync(data)
        toast({
          status: 'success',
          description: 'Your post has been updated.',
        })
        navigate(`/questions/${postId}`, { replace: true })
      } catch (err) {
        toast({
          status: 'error',
          description: getApiErrorMessage(err),
        })
      }
    }

    const isLoading = isPostLoading || isAnswerLoading || isTopicLoading

    return isLoading ? (
      <Spinner centerHeight="200px" />
    ) : (
      <>
        <Box sx={styles.container}>
          <Box sx={styles.content}>
            <Spacer h={['64px', '64px', '84px']} />
            <Box sx={styles.header}>Edit a Question</Box>
            <Box sx={styles.section}>
              <Box sx={styles.form} style={{ width: '100%' }}>
                {/* Undefined checks to coerce types. In reality all data should have loaded. */}
                <AskForm
                  inputPostData={{
                    title: postData?.title ?? '',
                    description: postData?.description ?? '',
                  }}
                  inputAnswerData={{
                    text: answerData ? answerData[0].body : '',
                  }}
                  topicOptions={topicData ?? []}
                  inputTopic={
                    postTopic
                      ? { value: postTopic[0].id, label: postTopic[0].name }
                      : { value: 0, label: '' }
                  }
                  submitButtonText="Confirm changes"
                  onSubmit={onSubmit}
                />
              </Box>
            </Box>
          </Box>
        </Box>
        <Spacer minH={20} />
      </>
    )
  }
}

export default EditForm
