import { Spacer } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Redirect, RouteComponentProps, useHistory } from 'react-router-dom'
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
  getTagsByUser,
  GET_TAGS_BY_USER_QUERY_KEY,
} from '../../services/TagService'
import AskForm, {
  AskFormSubmission,
} from '../PostForm/AskForm/AskForm.component'
import { useStyledToast } from '../../components/StyledToast/StyledToast'
import './EditForm.styles.scss'

type EditFormProps = RouteComponentProps<{ id: string }>

const EditForm = ({ match }: EditFormProps): JSX.Element => {
  const auth = useAuth()
  const queryclient = useQueryClient()
  const history = useHistory()
  const postId = Number(match.params.id)
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
  const { isLoading: isTagLoading, data: tagData } = useQuery(
    GET_TAGS_BY_USER_QUERY_KEY,
    getTagsByUser,
    {
      staleTime: Infinity,
    },
  )
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
      tagname: data.tags,
      topicId: null, //TODO: update when topics selection is introduced in frontend
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
      history.replace(`/questions/${postId}`)
    } catch (err) {
      toast({
        status: 'error',
        description: getApiErrorMessage(err),
      })
    }
  }

  if (!auth.user) {
    return <Redirect to="/login" />
  }

  const isLoading = isPostLoading || isAnswerLoading || isTagLoading

  return isLoading ? (
    <Spinner centerHeight="200px" />
  ) : (
    <>
      <div className="edit-form-container">
        <div className="edit-form-content">
          <Spacer h={['64px', '64px', '84px']} />
          <div className="edit-form-header">
            <div className="edit-form-headline fc-black-800">
              Edit a Question
            </div>
          </div>
          <div className="edit-form-section">
            <div className="editform" style={{ width: '100%' }}>
              {/* Undefined checks to coerce types. In reality all data should have loaded. */}
              <AskForm
                inputPostData={{
                  title: postData?.title ?? '',
                  description: postData?.description ?? '',
                }}
                inputAnswerData={{
                  text: answerData ? answerData[0].body : '',
                }}
                tagOptions={tagData ?? []}
                inputTags={postData?.tags.map((t) => t.tagname)}
                submitButtonText="Confirm changes"
                onSubmit={onSubmit}
              />
            </div>
          </div>
        </div>
      </div>
      <Spacer minH={20} />
    </>
  )
}

export default EditForm
