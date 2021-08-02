import {
  User as UserModel,
  Post as PostModel,
  Agency as AgencyModel,
  Answer as AnswerModel,
} from '../../bootstrap/sequelize'
import { PostStatus } from '../../types/post-status'
import helperFunction from '../../helpers/helperFunction'
import { Answer, Post } from '../../models'
import {
  HelperResult,
  HelperResultCallback,
} from '../../types/response-handler'
import { FindOptions } from 'sequelize/types'
import { createLogger } from '../../bootstrap/logging'

const logger = createLogger(module)

type AnswerWithRelations = Answer & {
  postId: string
  userId: string
}

type PostWithRelations = Post & {
  getAnswers: (options: FindOptions) => AnswerWithRelations[]
}

type AnswerJSON = Pick<Answer, 'body'> & {
  user: {
    displayname: string
    id: string
    agency: {
      logo: string
    }
  }
}
export class AnswersService {
  createAnswer = async ({
    postId,
    body,
    userId,
  }: Pick<
    AnswerWithRelations,
    'body' | 'postId' | 'userId'
  >): Promise<HelperResult> => {
    const answer = await AnswerModel.create({
      postId: postId,
      body: body,
      userId: userId,
    })
    await PostModel.update(
      { status: PostStatus.PUBLIC },
      { where: { id: postId } },
    )
    return [
      null,
      helperFunction.responseHandler(true, 200, 'Answer Added', answer.id),
    ]
  }

  update = async (
    updatedAnswer: {
      id: string
      body: string
    },
    result: HelperResultCallback,
  ): Promise<void> => {
    try {
      const res = await AnswerModel.update(
        { body: updatedAnswer.body },
        { where: { id: updatedAnswer.id } },
      )
      const changedRows = res[0]
      result(
        null,
        helperFunction.responseHandler(
          true,
          200,
          'Answer updated',
          changedRows,
        ),
      )
    } catch (error) {
      logger.error({
        message: 'Error while updating answer',
        meta: {
          function: 'update',
          answerId: updatedAnswer.id,
        },
        error,
      })
      result(
        helperFunction.responseHandler(
          false,
          error.statusCode,
          error.message,
          null,
        ),
        null,
      )
    }
  }

  remove = async (id: string, result: HelperResultCallback): Promise<void> => {
    try {
      await AnswerModel.destroy({ where: { id: id } })
      result(
        null,
        helperFunction.responseHandler(true, 200, 'Answer Removed', null),
      )
    } catch (error) {
      logger.error({
        message: 'Error while deleting answer',
        meta: {
          function: 'deleteAnswer',
          answerId: id,
        },
        error,
      })
      result(
        helperFunction.responseHandler(
          false,
          error.statusCode,
          error.message,
          null,
        ),
        null,
      )
    }
  }

  retrieveAll = async (
    postId: string,
  ): Promise<
    | {
        body: string
        username: string
        userId: string
        agencyLogo: string
      }[]
    | undefined
  > => {
    const post = (await PostModel.findOne({
      where: { id: postId },
    })) as PostWithRelations
    if (post) {
      const answers = await post.getAnswers({
        include: [
          {
            model: UserModel,
            include: [AgencyModel],
          },
        ],
      })

      // Redact user info except display name
      return answers.map((instance) => {
        const answer = instance.toJSON() as AnswerJSON
        const {
          user: {
            id,
            displayname,
            agency: { logo },
          },
          ...answerWithoutUser
        } = answer
        return {
          ...answerWithoutUser,
          username: displayname,
          userId: id,
          agencyLogo: logo,
        }
      })
    }
  }
}
