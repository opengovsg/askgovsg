import { Request, Response, RequestHandler } from 'express'
import { validationResult } from 'express-validator'
import { SortType } from '../../types/sort-type'
import { createValidationErrMessage } from '../../util/validation-error'
import { AuthService } from '../auth/auth.service'
import { PostService } from './post.service'

import { Message } from '../../types/message-type'
import { UpdatePostRequestDto } from '../../types/post-type'
import { createLogger } from '../../bootstrap/logging'
import { ControllerHandler } from '../../types/response-handler'
import { Post } from '../../models'

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

  listPosts: ControllerHandler<
    unknown,
    { posts: Post[]; totalItems: number } | Message,
    unknown,
    {
      page?: number
      size?: number
      sort?: SortType
      tags?: string
    }
  > = async (req, res) => {
    const { page, size, sort = SortType.Top, tags = '' } = req.query
    try {
      const data = await this.postService.retrieveAll({
        sort: sort as SortType,
        tags: tags as string,
        page: page,
        size: size,
      })
      return res.status(200).json(data)
    } catch (error) {
      if (error.message === 'Invalid tags used in request') {
        return res.status(422).json({ message: error })
      } else {
        logger.error({
          message: 'Error while listing posts',
          meta: {
            function: 'listPosts',
          },
          error,
        })
        return res.status(500).json({ message: 'Server Error' })
      }
    }
  }

  getSinglePost = async (req: Request, res: Response): Promise<Response> => {
    let post
    try {
      post = await this.postService.retrieveOne(req.params.id)
    } catch (error) {
      logger.error({
        message: 'Error while retrieving single post',
        meta: {
          function: 'getSinglePost',
        },
        error,
      })
      return res.status(500).json({ message: 'Server Error' })
    }

    try {
      await this.authService.verifyUserCanViewPost(
        post,
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

  addPost = async (req: Request, res: Response): Promise<Response> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array()[0].msg)
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
        return res.status(403).json({
          message:
            'You do not have permissions to post this question with the following tags: ' +
            listOfDisallowedTags.map((x) => x.tagname).join(', '),
        })
      }

      const data = await this.postService.createPostWithTag({
        title: req.body.title,
        description: req.body.description,
        userId: req.user?.id,
        tagname: req.body.tagname,
      })

      return res.status(200).json({ data: data })
    } catch (error) {
      logger.error({
        message: 'Error while creating post',
        meta: {
          function: 'addPost',
        },
        error,
      })
      return res.status(500).json({ message: 'Server error' })
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
      await this.postService.remove(postId)
      return res.sendStatus(200)
    } catch (error) {
      logger.error({
        message: 'Error while deleting post',
        meta: {
          function: 'deletePost',
        },
        error,
      })
      return res.status(500).json({ message: 'Server Error' })
    }
  }

  listAnswerablePosts: ControllerHandler<
    Record<string, never>,
    { posts: Post[]; totalItems: number } | Message,
    Record<string, never>,
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
      const { withAnswers, sort = SortType.Top, tags, page, size } = req.query
      const data = await this.postService.listAnswerablePosts({
        userId,
        sort: sort as SortType,
        withAnswers,
        tags,
        page,
        size,
      })
      return res.status(200).json(data)
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
