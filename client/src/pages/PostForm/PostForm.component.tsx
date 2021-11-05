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
  getTagsByUser,
  GET_TAGS_BY_USER_QUERY_KEY,
} from '../../services/TagService'
import AskForm, { AskFormSubmission } from './AskForm/AskForm.component'
import './PostForm.styles.scss'

const PostForm = (): JSX.Element => {
  const auth = useAuth()
  const toast = useStyledToast()
  const navigate = useNavigate()
  const { isLoading, data: tagData } = useQuery(
    GET_TAGS_BY_USER_QUERY_KEY,
    getTagsByUser,
    {
      staleTime: Infinity,
    },
  )
  if (!auth.user) {
    return <Navigate replace to="/login" />
  }

  const onSubmit = async (data: AskFormSubmission) => {
    try {
      const { data: postId } = await PostService.createPost({
        description: data.postData.description,
        title: data.postData.title,
        tagname: data.tags,
        topicId: null, //TODO: update when topics selection is introduced in frontend
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
                inputTags={tagData
                  ?.filter((t) => t.tagType === 'AGENCY')
                  .map((t) => t.tagname)}
                tagOptions={tagData ?? []}
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

export default PostForm
