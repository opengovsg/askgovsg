import { AuthMiddleware } from '../auth/auth.middleware'
import express from 'express'
import { check, query } from 'express-validator'
import { PostController } from './post.controller'
import { SortType } from '../../types/sort-type'

export const routePosts = ({
  controller,
  authMiddleware,
}: {
  controller: PostController
  authMiddleware: AuthMiddleware
}): express.Router => {
  const router = express.Router()
  /**
   * @route      GET /api/posts
   * @desc       fetch all posts
   * @access     Public
   */
  router.get('/', controller.listPosts)

  /**
   * @route      GET /api/posts/answerable
   * @desc       fetch all posts answerable by agency user
   * @access     Public
   */
  router.get(
    '/answerable',
    [
      query('withAnswers').isBoolean().toBoolean(),
      query('sort').isIn(Object.values(SortType)),
      query('tags').customSanitizer((value) => {
        if (!value) {
          return undefined
        }
        /*
        Transform req.query.tags into a string array of tags
        Accept a mixture of query param formats
        1. comma separated eg. tags=ema,ogp
        2. repeated query param eg. tags=ema&tags=ogp
        
        eg. if query params are tags=parking,parking-activate&tags=ogp
        req.query.tags = ['parking, parking-activate', 'ogp'] as body-parser accept query param format 2
        this custom santiser transforms req.query.tags into ['parking', 'parking-activate', 'ogp']
        */
        const tagsArray: string[] = [].concat(value)
        const nestedTags = tagsArray.map((tags) => tags.split(','))
        return ([] as string[]).concat(...nestedTags)
      }),
    ],
    controller.listAnswerablePosts,
  )

  /**
   * @route      GET /api/posts/:id
   * @desc       fetch a single post
   * @access     Public
   */
  router.get('/:id', controller.getSinglePost)

  /**
   * @route      POST /api/posts/
   * @desc       add a post
   * @access     Private
   */
  router.post(
    '/',
    [
      authMiddleware.authenticate,
      check(
        'title',
        'Enter a title with minimum 15 characters and maximum 150 characters',
      ).isLength({
        min: 15,
        max: 150,
      }),
      check('description', 'Enter a description with minimum 30 characters')
        .isLength({
          min: 30,
        })
        .optional({ nullable: true, checkFalsy: true }),
    ],
    controller.addPost,
  )

  /**
   * @route      Update /api/posts/:id
   * @desc       update a post
   * @access     Private
   */
  router.put('/:id', controller.updatePost)
  /**
   * @route      DELETE /api/posts/:id
   * @desc       delete a post
   * @access     Private
   */
  router.delete('/:id', controller.deletePost)
  return router
}
