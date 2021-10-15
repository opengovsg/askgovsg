import minimatch from 'minimatch'

import { PermissionType, Post, PostStatus } from '~shared/types/base'
import { Permission, PostTag, Tag, User } from '../../models'
import { createLogger } from '../../bootstrap/logging'
import { ModelCtor } from 'sequelize/types'
import { ModelDef } from 'src/types/sequelize'

const logger = createLogger(module)

export type PermissionWithRelations = Permission & {
  tagId: number
}

export type PostWithRelations = Post & {
  userId: number
}

export class AuthService {
  private emailValidator
  private User: ModelCtor<User>
  private PostTag: ModelDef<PostTag>
  private Permission: ModelCtor<Permission>

  constructor({
    emailValidator,
    User,
    PostTag,
    Permission,
  }: {
    emailValidator: minimatch.IMinimatch
    User: ModelCtor<User>
    PostTag: ModelDef<PostTag>
    Permission: ModelCtor<Permission>
  }) {
    this.emailValidator = emailValidator
    this.User = User
    this.PostTag = PostTag
    this.Permission = Permission
  }

  /**
   * Get the user from username only if user has validated email
   * @param username username of the user to retrieve
   * @returns user with the username
   */
  checkIfWhitelistedOfficer = async (username: string): Promise<User> => {
    if (!username) {
      throw new Error('username must be provided')
    }
    const user = await this.User.findOne({ where: { username } })
    if (this.isOfficerEmail(username)) {
      if (user) {
        return user
      } else {
        throw new Error('User is not a whitelisted officer')
      }
    } else {
      // prevent random users from login
      throw new Error('User is not a whitelisted officer')
    }
  }

  /**
   * Check if a user has permission to answer a post
   * @param userId of user
   * @param postId of post
   * @returns true if user has permission to answer post
   */
  hasPermissionToAnswer = async (
    userId: number,
    postId: number,
  ): Promise<boolean> => {
    const userTags = (await this.Permission.findAll({
      where: { userId },
    })) as PermissionWithRelations[]
    const postTags = await this.PostTag.findAll({
      where: { postId },
    })

    return postTags.every((postTag) => {
      const permission = userTags.find(
        (userTag) => userTag.tagId === postTag.tagId,
      )
      return permission && permission.role === PermissionType.Answerer
    })
  }

  /**
   * Get all tags that user does not have permission to add
   * @param userId of user
   * @param tagList list of tags
   * @returns subset of tagList that user is not allowed to add
   */
  getDisallowedTagsForUser = async (
    userId: number,
    tagList: Tag[],
  ): Promise<Tag[]> => {
    const userTags = (await this.Permission.findAll({
      where: { userId },
    })) as PermissionWithRelations[]
    return tagList.filter((postTag) => {
      const permission = userTags.find(
        (userTag) => userTag.tagId === postTag.id,
      )
      return !(permission && permission.role === PermissionType.Answerer)
    })
  }

  /**
   * Check if a user is able to view the post
   * @param post post to be viewed
   * @param userId id of user
   * @returns true if user can view post
   */
  verifyUserCanViewPost = async (
    post: PostWithRelations,
    userId?: string,
  ): Promise<void> => {
    // If post is public, anyone can view
    if (post.status === PostStatus.Public) return

    // If private or archived, must be logged in
    if (!userId)
      throw new Error('User must be logged in to access private post')
    const user = await this.User.findOne({ where: { id: userId } })

    if (user) {
      // If officer, they may have permission to answer
      if (this.isOfficerEmail(user.username)) {
        if (await this.hasPermissionToAnswer(user.id, post.id)) return
      }

      // If none of the above, they must have created the post
      if (user.id === post.userId) return
      throw new Error('User does not have permission to access post')
    }
  }

  /**
   * Check if user has an validated email
   * @param email email of user
   * @returns true if user has validated email
   */
  isOfficerEmail = (email: string): boolean => this.emailValidator.match(email)
}
