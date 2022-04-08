import { Box, Spacer, useMultiStyleConfig } from '@chakra-ui/react'
import { Fragment } from 'react'
import { useQuery } from 'react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../api'
import Spinner from '../../components/Spinner/Spinner.component'
import { useStyledToast } from '../../components/StyledToast/StyledToast'
import { useAuth } from '../../contexts/AuthContext'
import * as AnswerService from '../../services/AnswerService'
import * as PostService from '../../services/PostService'
import {
  getTopicsUsedByAgency,
  GET_TOPICS_USED_BY_AGENCY_QUERY_KEY,
} from '../../services/TopicService'
import AskForm, { AskFormSubmission } from './AskForm/AskForm.component'

const PostForm = (): JSX.Element => {
  const { user } = useAuth()
  const styles = useMultiStyleConfig('AdminForm', {})
  const toast = useStyledToast()
  const navigate = useNavigate()
  if (!user) {
    return <Navigate replace to="/login" />
  } else {
    const { isLoading, data: topicData } = useQuery(
      GET_TOPICS_USED_BY_AGENCY_QUERY_KEY,
      () => getTopicsUsedByAgency(user.agencyId),
      {
        staleTime: Infinity,
      },
    )
    const onSubmit = async (data: AskFormSubmission) => {
      try {
        const { data: postId } = await PostService.createPost({
          description: data.postData.description,
          title: data.postData.title,
          agencyId: user.agencyId,
          tagname: null, //TODO: Update when tags are re-introduced
          topicId: data.topic,
        })
        await AnswerService.createAnswer(postId, data.answerData)
        toast({
          status: 'success',
          description: 'Your post has been created.',
        })
        navigate(`/questions/${postId}`, { replace: true })
      } catch (err) {
        toast({
          status: 'error',
          description: getApiErrorMessage(err),
        })
      }
    }

    return isLoading ? (
      <Spinner centerHeight="200px" />
    ) : (
      <Fragment>
        <Box sx={styles.container}>
          <Box sx={styles.content}>
            <Spacer h={['64px', '64px', '84px']} />
            <Box sx={styles.header}>Post a Question</Box>
            <Box sx={styles.section}>
              <Box sx={styles.form}>
                {/* Undefined checks to coerce types. In reality all data should have loaded. */}
                <AskForm
                  topicOptions={topicData ?? []}
                  onSubmit={onSubmit}
                  submitButtonText="Post your question"
                />
              </Box>
            </Box>
          </Box>
        </Box>
        <Spacer minH={20} />
      </Fragment>
    )
  }
}

export default PostForm
