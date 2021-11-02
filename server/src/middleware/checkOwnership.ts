import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Answer, Post, User } from '~shared/types/base'
import { PostCreation } from '../models/posts.model'
import { Message } from '../types/message-type'
import { ControllerHandler } from '../types/response-handler'
import { ModelDef } from '../types/sequelize'

type AnswerWithRelations = Answer & {
  userId: number
  post: Post
}
export type OwnershipCheck = ControllerHandler<
  { id: string },
  Message,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>
export const checkOwnershipUsing = ({
  Answer,
  Post,
  User,
}: {
  Answer: ModelDef<Answer>
  Post: ModelDef<Post, PostCreation>
  User: ModelDef<User>
}): OwnershipCheck => {
  const checkOwnership: OwnershipCheck = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    const results = (await Answer.findOne({
      where: { id: req.params.id },
      attributes: ['userId'],
      include: [
        {
          model: Post,
        },
      ],
    })) as unknown as AnswerWithRelations
    if (!results) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'No answer found with this ID' })
    }
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'User not signed in' })
    }

    const user = await User.findByPk(req.user.id)

    if (!user) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: `User ${req.user.id} does not exist`,
      })
    }

    if (user?.agencyId !== results.post.agencyId) {
      const message = `User ${req.user.id} is not authorized to manage this question`
      return res.status(StatusCodes.FORBIDDEN).json({ message: message })
    }

    next()
  }
  return checkOwnership
}
