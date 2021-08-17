import { Request, Response, RequestHandler } from 'express'
import { validationResult } from 'express-validator'
import helperFunction from '../../helpers/helperFunction'
import { SortType } from '../../types/sort-type'
import { createValidationErrMessage } from '../../util/validation-error'
import { AuthService } from '../auth/auth.service'
import { PostService } from './post.service'

import { Message } from '../../types/message-type'
import { UpdatePostRequestDto } from '../../types/post-type'
import { createLogger } from '../../bootstrap/logging'

const logger = createLogger(module)

export class PostController {
  private authService: Public<AuthService>
  private postService: Public<PostService>

  constructor({
    authService,
    postService,
  }: {
    authService: Public<AuthService>
    postService: Public<PostService>
  }) {
    this.authService = authService
    this.postService = postService
  }

  listPosts = async (req: Request, res: Response): Promise<Response> => {
    const { query } = req
    const { sort = SortType.Top, tags = '' } = query
    try {
      const [err, data] = await this.postService.retrieveAll({
        sort: sort as SortType,
        tags: tags as string,
      })
      if (err) {
        return res.status(err.code).json(err)
      }
      return res.status(data?.code || 200).json(data?.data)
    } catch (error) {
      logger.error({
        message: 'Error while listing posts',
        meta: {
          function: 'listPosts',
        },
        error,
      })
      return res
        .status(500)
        .json(helperFunction.responseHandler(true, 500, 'Server Error', null))
    }
  }

  getSinglePost = async (req: Request, res: Response): Promise<Response> => {
    let post
    try {
      const [error, data] = await this.postService.retrieveOne(req.params.id)
      if (error) {
        logger.error({
          message: 'Error while retrieving single post',
          meta: {
            function: 'getSinglePost',
          },
          error,
        })
        return res.status(error.code).json(error)
      }
      post = data?.data
    } catch (error) {
      logger.error({
        message: 'Error while retrieving single post',
        meta: {
          function: 'getSinglePost',
        },
        error,
      })
      return res
        .status(500)
        .json(helperFunction.responseHandler(false, 500, 'Server Error', null))
    }

    try {
      await this.authService.verifyUserCanViewPost(
        post.toJSON(),
        req.header('x-auth-token') ?? '',
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
        .status(403)
        .json({ message: 'User does not have permission to access this post' })
    }

    return res.status(200).json(post)
  }

  getTopPosts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const [err, data] = await this.postService.getTopPosts()
      if (err) {
        return res.status(err.code).json(err)
      }
      return res.status(data?.code || 200).json(data?.data)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving top posts',
        meta: {
          function: 'getTopPosts',
        },
        error,
      })
      return res
        .status(500)
        .json(helperFunction.responseHandler(false, 500, 'Server Error', null))
    }
  }

  addPost = async (req: Request, res: Response): Promise<Response> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(
          helperFunction.responseHandler(
            false,
            400,
            errors.array()[0].msg,
            null,
          ),
        )
    }
    if (!req.user) {
      return res.status(401).json({ message: 'User not signed in' })
    }

    try {
      // check permissions
      const listOfDisallowedTags =
        await this.authService.getDisallowedTagsForUser(
          req.user?.id,
          await this.postService.getExistingTagsFromRequestTags(
            req.body.tagname,
          ),
        )
      if (listOfDisallowedTags.length > 0) {
        return res
          .status(403)
          .json(
            helperFunction.responseHandler(
              false,
              403,
              'You do not have permissions to post this question with the following tags: ' +
                listOfDisallowedTags.map((x) => x.tagname).join(', '),
              null,
            ),
          )
      }

      const [error, data] = await this.postService.createPostWithTag({
        title: req.body.title,
        description: req.body.description,
        userId: req.user?.id,
        tagname: req.body.tagname,
      })

      if (error) {
        logger.error({
          message: 'Error while creating post',
          meta: {
            function: 'addPost',
          },
          error,
        })
        return res.status(error.code).json(error)
      }
      return res.status(data?.code || 200).json(data)
    } catch (error) {
      logger.error({
        message: 'Error while creating post',
        meta: {
          function: 'addPost',
        },
        error,
      })
      return res
        .status(500)
        .json(helperFunction.responseHandler(false, 500, 'Server Error', null))
    }
  }

  deletePost = async (req: Request, res: Response): Promise<Response> => {
    const postId = req.params.id
    try {
      const userId = await this.authService.getUserIdFromToken(
        req.header('x-auth-token') ?? '',
      )
      if (!userId) {
        return res
          .status(401)
          .json({ message: 'You must be logged in to delete posts.' })
      }
      const hasPermission = await this.authService.hasPermissionToAnswer(
        userId,
        postId,
      )
      if (!hasPermission) {
        return res
          .status(403)
          .json({ message: 'You do not have permission to delete this post.' })
      }
    } catch (error) {
      logger.error({
        message: 'Error while determining permissions to delete post',
        meta: {
          function: 'deletePost',
        },
        error,
      })
      return res
        .status(500)
        .json({ message: 'Something went wrong, please try again.' })
    }
    try {
      const [error, data] = await this.postService.remove(postId)
      if (error) {
        logger.error({
          message: 'Error while deleting post',
          meta: {
            function: 'deletePost',
          },
          error,
        })
        return res.status(error.code).json(error)
      }
      return res.status(data?.code || 200).json(data)
    } catch (error) {
      logger.error({
        message: 'Error while deleting post',
        meta: {
          function: 'deletePost',
        },
        error,
      })
      return res
        .status(500)
        .json(helperFunction.responseHandler(false, 500, 'Server Error', null))
    }
  }

  listAnswerablePosts = async (
    req: Request<
      never,
      Record<string, unknown>,
      Record<string, unknown>,
      { withAnswers: boolean; sort: string; tags?: string[] }
    >,
    res: Response,
  ): Promise<Response> => {
    // Validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: createValidationErrMessage(errors) })
    }

    // Authorisation checks
    const token = req.header('x-auth-token') ?? ''
    let userId
    try {
      userId = await this.authService.getUserIdFromToken(token)
      if (!userId) throw new Error('User must be signed in to access posts')
      await this.authService.getOfficerUser(userId)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving user ID',
        meta: {
          function: 'listAnswerablePosts',
        },
        error,
      })
      return res.status(401).json({
        message: 'Please log in and try again',
      })
    }

    try {
      const { sort, withAnswers, tags } = req.query
      const [error, data] = await this.postService.listAnswerablePosts({
        userId,
        sort: sort as SortType,
        withAnswers,
        tags,
      })
      if (error) {
        logger.error({
          message: 'Error while retrieving answerable posts',
          meta: {
            function: 'listAnswerablePosts',
          },
          error,
        })
        return res.status(error.code).json(error)
      }
      return res.status(data?.code || 200).json(data?.data)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving answerable posts',
        meta: {
          function: 'listAnswerablePosts',
        },
        error,
      })
      return res.status(500).json({
        message: 'Sorry, something went wrong. Please try again.',
      })
    }
  }

  updatePost: RequestHandler<
    { id: string },
    Message,
    UpdatePostRequestDto,
    unknown
  > = async (req, res) => {
    const postId = req.params.id
    try {
      const userId = await this.authService.getUserIdFromToken(
        req.header('x-auth-token') ?? '',
      )
      if (!userId) {
        return res
          .status(401)
          .json({ message: 'You must be logged in to update posts.' })
      }
      const hasPermission = await this.authService.hasPermissionToAnswer(
        userId,
        postId,
      )
      if (!hasPermission) {
        return res
          .status(403)
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
        .status(500)
        .json({ message: 'Something went wrong, please try again.' })
    }
    const errors = validationResult(req as Request)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }
    // Update post in database
    try {
      const updated = await this.postService.update({
        title: req.body.title,
        description: req.body.description ?? '',
        tagname: req.body.tagname,
        id: postId,
      })

      if (!updated) {
        return res.status(500).json({ message: 'Answer failed to update' })
      }
      return res.status(200).json({ message: 'Answer updated' })
    } catch (err) {
      return res.status(500).json({ message: 'Answer failed to update' })
    }
  }
}
