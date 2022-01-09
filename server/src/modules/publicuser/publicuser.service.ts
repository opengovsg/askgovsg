import { okAsync, ResultAsync } from 'neverthrow'
import { createLogger } from '../../bootstrap/logging'
import { PublicUser } from '~shared/types/base'
import { ModelDef } from '../../types/sequelize'
import { DatabaseError } from '../core/core.errors'
import { LoadPublicUserDto } from '~shared/types/api'

const logger = createLogger(module)

export class PublicUserService {
  private PublicUser: ModelDef<PublicUser>

  constructor({ PublicUser }: { PublicUser: ModelDef<PublicUser> }) {
    this.PublicUser = PublicUser
  }

  loadPublicUser = async (userId: number): Promise<LoadPublicUserDto> => {
    return this.PublicUser.findByPk(userId) as Promise<LoadPublicUserDto>
  }

  loadPublicUserBySgid = async (sgid: string): Promise<LoadPublicUserDto> => {
    return this.PublicUser.findOne({ where: { sgid: sgid } })
  }

  /**
   * Create a new topic
   * @param newTopic Topic to be created
   * @returns ok(topic) if the new topic is successfully created
   * @returns err(DatabaseError) if database errors occur while creating new topic
   */
  createPublicUserBySgid = (
    sgid: string,
  ): ResultAsync<PublicUser, DatabaseError> => {
    return ResultAsync.fromPromise(
      this.PublicUser.create({
        sgid: sgid,
        displayname: 'guest',
        email: 'john@open.gov.sg',
        active: true,
      }),
      (error) => {
        logger.error({
          message: 'Database error while creating new public user',
          meta: {
            function: 'createPublicUserBySgid',
          },
          error,
        })
        return new DatabaseError()
      },
    ).andThen((publicUser) => {
      logger.info({
        message: 'Success in creating new public user',
        meta: {
          function: 'createPublicUserBySgid',
        },
      })
      return okAsync(publicUser)
    })
  }
}
