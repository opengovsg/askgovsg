import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { ControllerHandler } from '../../../types/response-handler'
import supertest from 'supertest'
import { AnswersController } from '../answers.controller'

describe('AnswersController', () => {
  const answersService = {
    listAnswers: jest.fn(),
    createAnswer: jest.fn(),
    updateAnswer: jest.fn(),
    deleteAnswer: jest.fn(),
  }
  const authService = {
    hasPermissionToAnswer: jest.fn(),
  }

  const answersController = new AnswersController({
    answersService,
    authService,
  })

  // Set up auth middleware to inject user
  const goodUser = { id: 1 }
  let user: Express.User | undefined = goodUser
  const middleware: ControllerHandler = (req, _res, next) => {
    req.user = user
    next()
  }

  const noErrors: { errors: () => { msg: string }[] }[] = []
  let errors: { errors: () => { msg: string }[] }[] = noErrors
  const invalidateIfHasErrors: ControllerHandler = (req, _res, next) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req['express-validator#contexts'] = errors
    next()
  }

  const postId = 1
  const postPath = `/${postId}`

  const answer = { id: 4, userId: user.id, postId, body: 'Answer Body' }
  const answerPath = `/${answer.id}`

  beforeEach(() => {
    user = goodUser
    jest.resetAllMocks()
  })

  describe('listAnswers', () => {
    const app = express()
    app.get('/:id', answersController.listAnswers)

    const request = supertest(app)

    it('returns OK on valid query', async () => {
      const answers = [answer]
      answersService.listAnswers.mockResolvedValueOnce(answers)
      const response = await request.get(postPath)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(answers)
      expect(answersService.listAnswers).toHaveBeenCalledWith(postId)
    })

    it('returns INTERNAL_SERVER_ERROR on bad service', async () => {
      answersService.listAnswers.mockRejectedValue(new Error())

      const response = await request.get(postPath)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({ message: 'Server Error' })
      expect(answersService.listAnswers).toHaveBeenCalledWith(postId)
    })
  })

  describe('createAnswer', () => {
    const app = express()
    app.use(express.json())
    app.use(middleware)
    app.use(invalidateIfHasErrors)
    app.post('/:id', answersController.createAnswer)
    const request = supertest(app)

    beforeEach(() => {
      user = goodUser
      errors = noErrors
      authService.hasPermissionToAnswer.mockResolvedValue(true)
      answersService.createAnswer.mockResolvedValue(answer.id)
    })

    it('returns BAD_REQUEST on bad request', async () => {
      errors = [
        {
          errors: () => [
            {
              msg: 'Validation Error',
            },
          ],
        },
      ]

      const response = await request.post(postPath).send({ text: answer.body })

      expect(response.status).toEqual(StatusCodes.BAD_REQUEST)
      expect(answersService.createAnswer).not.toHaveBeenCalled()
    })

    it('returns UNAUTHORIZED on no user', async () => {
      user = undefined

      const response = await request.post(postPath).send({ text: answer.body })

      expect(response.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(response.body).toStrictEqual({ message: 'User not signed in' })
      expect(answersService.createAnswer).not.toHaveBeenCalled()
    })

    it('returns FORBIDDEN on no user', async () => {
      authService.hasPermissionToAnswer.mockResolvedValue(false)

      const response = await request.post(postPath).send({ text: answer.body })

      expect(response.status).toEqual(StatusCodes.FORBIDDEN)
      expect(response.body).toStrictEqual({
        message: 'You do not have permissions to answer question',
      })
      expect(answersService.createAnswer).not.toHaveBeenCalled()
    })

    it('returns OK on valid submission', async () => {
      const response = await request.post(postPath).send({ text: answer.body })

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(answer.id)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...answerAttributes } = answer
      expect(answersService.createAnswer).toHaveBeenCalledWith(answerAttributes)
    })

    it('returns INTERNAL_SERVER_ERROR on bad service', async () => {
      answersService.createAnswer.mockRejectedValue(new Error())

      const response = await request.post(postPath).send({ text: answer.body })

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({ message: 'Server Error' })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...answerAttributes } = answer
      expect(answersService.createAnswer).toHaveBeenCalledWith(answerAttributes)
    })
  })

  describe('updateAnswer', () => {
    const app = express()
    app.use(express.json())
    app.use(invalidateIfHasErrors)
    app.put('/:id', answersController.updateAnswer)
    const request = supertest(app)

    beforeEach(() => {
      errors = noErrors
      answersService.updateAnswer.mockResolvedValue(answer.id)
    })

    it('returns BAD_REQUEST on bad request', async () => {
      errors = [
        {
          errors: () => [
            {
              msg: 'Validation Error',
            },
          ],
        },
      ]

      const response = await request.put(answerPath).send({ text: answer.body })

      expect(response.status).toEqual(StatusCodes.BAD_REQUEST)
      expect(answersService.updateAnswer).not.toHaveBeenCalled()
    })

    it('returns OK on valid submission', async () => {
      const response = await request.put(answerPath).send({ text: answer.body })

      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual(answer.id)

      expect(answersService.updateAnswer).toHaveBeenCalledWith({
        id: answer.id,
        body: answer.body,
      })
    })

    it('returns INTERNAL_SERVER_ERROR on bad service', async () => {
      answersService.updateAnswer.mockRejectedValue(new Error())

      const response = await request.put(answerPath).send({ text: answer.body })

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({ message: 'Server Error' })

      expect(answersService.updateAnswer).toHaveBeenCalledWith({
        id: answer.id,
        body: answer.body,
      })
    })
  })

  describe('deleteAnswer', () => {
    const app = express()
    app.delete('/:id', answersController.deleteAnswer)
    const request = supertest(app)

    it('returns OK on valid query', async () => {
      const response = await request.delete(answerPath)

      expect(response.status).toEqual(StatusCodes.OK)
      expect(answersService.deleteAnswer).toHaveBeenCalledWith(answer.id)
    })

    it('returns INTERNAL_SERVER_ERROR on bad service', async () => {
      answersService.deleteAnswer.mockRejectedValue(new Error())

      const response = await request.delete(answerPath)

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(response.body).toStrictEqual({ message: 'Server Error' })
      expect(answersService.deleteAnswer).toHaveBeenCalledWith(answer.id)
    })
  })
})
