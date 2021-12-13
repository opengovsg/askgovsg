import type { Sequelize as SequelizeType } from 'sequelize'
import { Answer, Post, PostStatus } from '~shared/types/base'
import { PostCreation } from '../../models/posts.model'
import { ModelDef } from '../../types/sequelize'
import { ApplicationError } from '../core/core.errors'
import { SyncService as SearchSyncService } from '../search/sync/sync.service'

export class AnswersService {
  private Post: ModelDef<Post, PostCreation>
  private Answer: ModelDef<Answer>
  private searchSyncService: Pick<
    SearchSyncService,
    'createPost' | 'updatePost'
  >
  private sequelize: SequelizeType

  constructor({
    Post,
    Answer,
    searchSyncService,
    sequelize,
  }: {
    Post: ModelDef<Post, PostCreation>
    Answer: ModelDef<Answer>
    searchSyncService: Pick<SearchSyncService, 'createPost' | 'updatePost'>
    sequelize: SequelizeType
  }) {
    this.Post = Post
    this.Answer = Answer
    this.searchSyncService = searchSyncService
    this.sequelize = sequelize
  }

  private searchIndexName = 'search_entries'

  /**
   * Returns all answers to a post
   * @param postId id of the post
   * @returns an array of answers
   */
  listAnswers = async (postId: number): Promise<Answer[]> => {
    const answers = await this.Answer.findAll({
      where: { postId },
    })
    return answers
  }

  /**
   * Create an answer attached to a post
   * @param postId id of post to attach to
   * @param body answer text
   * @param userId id of user that submitted the answer
   * @returns id of new answer if it is successfully created
   */
  createAnswer = async ({
    postId,
    body,
    userId,
  }: Pick<Answer, 'body' | 'postId' | 'userId'>): Promise<number> => {
    try {
      const answerId = await this.sequelize.transaction(async (transaction) => {
        const answer = await this.Answer.create(
          {
            postId: postId,
            body: body,
            userId: userId,
          },
          { transaction },
        )
        await this.Post.update(
          { status: PostStatus.Public },
          { where: { id: postId }, transaction },
        )
        const updatePostResponse = await this.searchSyncService.updatePost(
          this.searchIndexName,
          {
            postId,
            answers: [body],
          },
        )
        if (updatePostResponse.isErr()) throw updatePostResponse.error
        return answer.id
      })
      return answerId
    } catch (error) {
      throw error
    }
  }

  /**
   * Update an answer
   * @param id of answer to update
   * @param body answer text to change to
   * @returns number of rows changed in answer database
   */
  updateAnswer = async (updatedAnswer: {
    id: number
    body: string
  }): Promise<number> => {
    try {
      const answersChanged = await this.sequelize.transaction(
        async (transaction) => {
          const answers = await this.Answer.update(
            { body: updatedAnswer.body },
            { where: { id: updatedAnswer.id }, transaction },
          )
          const answerFound = await this.Answer.findByPk(updatedAnswer.id)
          if (!answerFound) {
            throw new ApplicationError(
              `No answers of id ${updatedAnswer.id} found`,
            )
          }
          const updatePostResponse = await this.searchSyncService.updatePost(
            this.searchIndexName,
            {
              postId: answerFound.postId,
              answers: [updatedAnswer.body],
            },
          )
          if (updatePostResponse.isErr()) throw updatePostResponse.error
          return answers[0]
        },
      )
      return answersChanged
    } catch (error) {
      throw error
    }
  }

  /**
   * Delete an answer. Currently not used as a post delete
   * will archive the post and will not touch the answer.
   * @param id of answer to delete
   */
  deleteAnswer = async (id: number): Promise<void> => {
    await this.Answer.destroy({ where: { id } })
  }
}
