import { validationResult } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { Post } from '~shared/types/base'
import { createLogger } from '../../bootstrap/logging'
import { Message } from '../../types/message-type'
import { UpdatePostRequestDto } from '../../types/post-type'
import { ControllerHandler } from '../../types/response-handler'
import { SortType } from '../../types/sort-type'
import { createValidationErrMessage } from '../../util/validation-error'
import { AuthService } from '../auth/auth.service'
import { UserService } from '../user/user.service'
import {
  PostService,
  PostWithUserTopicTagRelatedPostRelations,
  PostWithUserTopicTagRelations,
} from './post.service'

const logger = createLogger(module)

export class PostController {
  private authService: Public<AuthService>
  private postService: Public<PostService>
  private userService: Public<UserService>

  constructor({
    authService,
    postService,
    userService,
  }: {
    authService: Public<AuthService>
    postService: Public<PostService>
    userService: Public<UserService>
  }) {
    this.authService = authService
    this.postService = postService
    this.userService = userService
  }

  /**
   * Lists all post
   * @query sort Sort by popularity or recent
   * @query tags Tags to filter by
   * @query size Number of posts to return
   * @query page If size is given, specify which page to return
   * @return 200 with posts and totalItem for pagination
   * @return 422 if invalid tags are used in request
   * @return 500 when database error occurs
   */
  listPosts: ControllerHandler<
    undefined,
    { posts: Post[]; totalItems: number } | Message,
    undefined,
    {
      page?: number
      size?: number
      sort?: SortType
      tags?: string
    }
  > = async (req, res) => {
    const { page, size, sort = SortType.Top, tags = '' } = req.query
    try {
      const data = await this.postService.listPosts({
        sort: sort as SortType,
        tags: tags as string,
        page: page,
        size: size,
      })
      return res.status(StatusCodes.OK).json(data)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid tags used in request') {
          return res.status(422).json({ message: error.message })
        } else {
          logger.error({
            message: 'Error while listing posts',
            meta: {
              function: 'listPosts',
            },
            error,
          })
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: 'Server Error' })
        }
      }
    }
  }

  /**
   * Lists all post answerable by the agency user
   * @query sort Sort by popularity or recent
   * @query withAnswers If false, show only posts without answers
   * @query tags Tags to filter by
   * @query size Number of posts to return
   * @query page If size is given, specify which page to return
   * @return 200 with posts and totalItem for pagination
   * @return 400 if `withAnswers`, `sort` or `tags` query is not given
   * @return 401 if userID is invalid
   * @return 500 if invalid tags are used in request
   * @return 500 when database error occurs
   */
  listAnswerablePosts: ControllerHandler<
    undefined,
    { posts: Post[]; totalItems: number } | Message,
    undefined,
    {
      withAnswers: boolean
      sort?: string
      tags?: string[]
      page?: number
      size?: number
    }
  > = async (req, res) => {
    // Validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: createValidationErrMessage(errors) })
    }

    const userId = req.user?.id
    if (!userId) {
      logger.error({
        message: 'UserId is undefined after authenticated',
        meta: {
          function: 'updatePost',
        },
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Something went wrong, please try again.' })
    }
    try {
      const { withAnswers, sort = SortType.Top, tags, page, size } = req.query
      const data = await this.postService.listAnswerablePosts({
        userId,
        sort: sort as SortType,
        withAnswers,
        tags,
        page,
        size,
      })
      return res.status(StatusCodes.OK).json(data)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving answerable posts',
        meta: {
          function: 'listAnswerablePosts',
        },
        error,
      })
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Sorry, something went wrong. Please try again.',
      })
    }
  }

  /**
   * Get a single post and all the tags, topic and users associated with it
   * @param postId Id of the post
   * @query relatedPosts if true, return related posts
   * @return 200 with post
   * @return 403 if user does not have permission to access post
   * @return 500 for database error
   */
  getSinglePost: ControllerHandler<
    { id: number },
    | PostWithUserTopicTagRelations
    | PostWithUserTopicTagRelatedPostRelations
    | Message,
    undefined,
    { relatedPosts?: number }
  > = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json(errors.array()[0].msg)
    }
    let post
    try {
      post = await this.postService.getSinglePost(
        req.params.id,
        req.query.relatedPosts,
      )
    } catch (error) {
      logger.error({
        message: 'Error while retrieving single post',
        meta: {
          function: 'getSinglePost',
        },
        error,
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server Error' })
    }

    try {
      await this.authService.verifyUserCanViewPost(
        post,
        req.user?.id.toString() ?? '',
      )
    } catch (error) {
      logger.error({
        message: 'Error while retrieving single post',
        meta: {
          function: 'getSinglePost',
        },
        error,
      })
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'User does not have permission to access this post' })
    }

    return res.status(StatusCodes.OK).json(post)
  }

  /**
   * Create a new post
   * @body title title of post
   * @body tagname tags of post
   * @body description description of post
   * @body topicname topic of post
   * @return 200 if post is created
   * @return 400 if title and description is too short or long
   * @return 401 if user is not signed in
   * @return 403 if user does not have permission to add some of the tags
   * @return 500 if database error
   */
  createPost: ControllerHandler<
    undefined,
    { data: number } | Message,
    {
      title: string
      tagname: string[]
      description: string
      topicname: string
    },
    undefined
  > = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json(errors.array()[0].msg)
    }
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'User not signed in' })
    }

    try {
      const user = await this.userService.loadUser(req.user?.id)

      if (!user?.agencyId) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'The current user is not associated with an agency',
        })
      }

      const data = await this.postService.createPost({
        title: req.body.title,
        description: req.body.description,
        userId: req.user?.id,
        agencyId: user?.agencyId,
        tagname: req.body.tagname,
        topicname: req.body.topicname,
      })

      return res.status(StatusCodes.OK).json({ data: data })
    } catch (error) {
      logger.error({
        message: 'Error while creating post',
        meta: {
          function: 'addPost',
        },
        error,
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server error' })
    }
  }

  /**
   * Delete a post
   * @param id Post to be deleted
   * @return 200 if successful
   * @return 401 if user is not logged in
   * @return 403 if user does not have permission to delete post
   * @return 500 if database error
   */
  deletePost: ControllerHandler<{ id: string }, Message> = async (req, res) => {
    const postId = Number(req.params.id)
    try {
      const userId = req.user?.id
      if (!userId) {
        logger.error({
          message: 'UserId is undefined after authenticated',
          meta: {
            function: 'deletePost',
          },
        })
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: 'You must be logged in to delete posts.' })
      }
      const hasPermission = await this.authService.hasPermissionToAnswer(
        userId,
        postId,
      )
      if (!hasPermission) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: 'You do not have permission to delete this post.' })
      }
      await this.postService.deletePost(postId)
      return res.status(StatusCodes.OK).send({ message: 'OK' })
    } catch (error) {
      logger.error({
        message: 'Error while deleting post',
        meta: {
          function: 'deletePost',
        },
        error,
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Server Error' })
    }
  }

  /**
   * Update a post
   * @param id id of post to update
   * @body Post Post to be updated
   * @return 200 if successful
   * @return 400 if title and description is too short or long
   * @return 401 if user is not logged in
   * @return 403 if user does not have permission to delete post
   * @return 500 if database error
   */
  updatePost: ControllerHandler<
    { id: string },
    Message,
    UpdatePostRequestDto,
    undefined
  > = async (req, res) => {
    const postId = Number(req.params.id)
    try {
      const userId = req.user?.id
      if (!userId) {
        logger.error({
          message: 'UserId is undefined after authenticated',
          meta: {
            function: 'updatePost',
          },
        })
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: 'Something went wrong, please try again.' })
      }
      const hasPermission = await this.authService.hasPermissionToAnswer(
        userId,
        postId,
      )
      if (!hasPermission) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: 'You do not have permission to update this post.' })
      }
    } catch (error) {
      logger.error({
        message: 'Error while determining permissions to update post',
        meta: {
          function: 'updatePost',
        },
        error,
      })
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Something went wrong, please try again.' })
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: errors.array()[0].msg })
    }
    // Update post in database
    try {
      const updated = await this.postService.updatePost({
        title: req.body.title,
        description: req.body.description ?? '',
        tagname: req.body.tagname,
        id: postId,
      })

      if (!updated) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: 'Answer failed to update' })
      }
      return res.status(StatusCodes.OK).json({ message: 'Answer updated' })
    } catch (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Answer failed to update' })
    }
  }
}
