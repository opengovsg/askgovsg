import { Spacer } from '@chakra-ui/react'
import { Fragment } from 'react'
import { useQuery } from 'react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/ApiClient'
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
import './PostForm.styles.scss'

const PostForm = (): JSX.Element => {
  const { user } = useAuth()
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
        <div className="post-form-container">
          <div className="post-form-content">
            <Spacer h={['64px', '64px', '84px']} />
            <div className="post-form-header">
              <div className="post-form-headline fc-black-800">
                Post a Question
              </div>
            </div>
            <div className="post-form-section">
              <div className="postform" style={{ width: '100%' }}>
                {/* Undefined checks to coerce types. In reality all data should have loaded. */}
                <AskForm
                  topicOptions={topicData ?? []}
                  onSubmit={onSubmit}
                  submitButtonText="Post your question"
                />
              </div>
            </div>
          </div>
        </div>
        <Spacer minH={20} />
      </Fragment>
    )
  }
}

export default PostForm
