import { ModelDef } from '../../types/sequelize'
import { Topic } from '~shared/types/base'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'
import { createLogger } from '../../bootstrap/logging'
import { MissingTopicError } from './topics.errors'
import { DatabaseError } from '../core/core.errors'

const logger = createLogger(module)

export type TopicWithChildRelations = Topic & {
  children: Topic[]
}

export class TopicsService {
  private Topic: ModelDef<Topic>

  constructor({ Topic }: { Topic: ModelDef<Topic> }) {
    this.Topic = Topic
  }

  /**
   * Find a topic by their id
   * @param topicId Topic's id
   * @returns ok(topic) if retrieval is successful
   * @returns err(DatabaseError) if database errors occur while retrieving topic
   * @returns err(MissingTopicError) if topic does not exist in the database
   */
  findOneById = (
    id: number,
  ): ResultAsync<Topic, DatabaseError | MissingTopicError> => {
    return ResultAsync.fromPromise(
      this.Topic.findOne({
        where: { id: id },
      }),
      (error) => {
        logger.error({
          message: 'Database error while retrieving single topic by id',
          meta: {
            function: 'findOneById',
            id,
          },
          error,
        })
        return new DatabaseError()
      },
    ).andThen((topic) => {
      if (!topic) {
        return errAsync(new MissingTopicError())
      }
      return okAsync(topic)
    })
  }

  /**
   * Find an agency's topics by their agencyid
   * @param agencyId id of agency
   * @returns ok(nested list of topics) if successful
   * @returns err(DatabaseError) if database errors occur while retrieving list of topics
   * @returns err(MissingTopicError) if agency does not have any topics in the database
   */

  listTopicsUsedByAgency = (
    agencyId: number,
  ): ResultAsync<
    TopicWithChildRelations[],
    DatabaseError | MissingTopicError
  > => {
    return ResultAsync.fromPromise(
      this.Topic.findAll({
        where: {
          agencyId: agencyId,
        },
      }),
      (error) => {
        logger.error({
          message: 'Database error while retrieving topics by agency id',
          meta: {
            function: 'listTopicsUsedByAgency',
            agencyId,
          },
          error,
        })
        return new DatabaseError()
      },
    ).andThen((agencyTopics) => {
      if (!agencyTopics) {
        return errAsync(new MissingTopicError())
      }
      const hashTable = Object.create(null)
      agencyTopics.forEach(
        (topic) => (hashTable[topic.id] = { ...topic, children: [] }),
      )
      const topicTree: TopicWithChildRelations[] = []
      agencyTopics.forEach((topic) => {
        if (topic.parentId)
          hashTable[topic.parentId].children.push(hashTable[topic.id])
        else topicTree.push(hashTable[topic.id])
      })
      return okAsync(topicTree)
    })
  }

  /**
   * Create a new topic
   * @param newTopic Topic to be created
   * @returns ok(topic) if the new topic is successfully created
   * @returns err(DatabaseError) if database errors occur while creating new topic
   */
  createTopic = (newTopic: {
    name: string
    description: string
    parentId: number
    agencyId: number
  }): ResultAsync<Topic, DatabaseError> => {
    return ResultAsync.fromPromise(
      this.Topic.create({
        name: newTopic.name,
        description: newTopic.description,
        parentId: newTopic.parentId,
        agencyId: newTopic.agencyId,
      }),
      (error) => {
        logger.error({
          message: 'Database error while creating new topic',
          meta: {
            function: 'createTopic',
          },
          error,
        })
        return new DatabaseError()
      },
    ).andThen((topic) => {
      return okAsync(topic)
    })
  }

  /**
   * Delete a topic
   * @param id Id of topic to be deleted
   * @returns ok(number of destroyed rows) if deletion was successful
   * @returns err(DatabaseError) if database errors occur while deleting topic
   */
  deleteTopicById = (id: number): ResultAsync<number, DatabaseError> => {
    return ResultAsync.fromPromise(
      this.Topic.destroy({
        where: { id: id },
      }),
      (error) => {
        logger.error({
          message: 'Database error while deleting single topic by id',
          meta: {
            function: 'deleteTopicById',
            id,
          },
          error,
        })
        return new DatabaseError()
      },
    ).andThen((destroyedRows) => {
      return okAsync(destroyedRows)
    })
  }

  /**
   * Update a topic
   * @param Topic Topic to be updated
   * @returns ok(number of rows changed in database) if update was successful
   * @returns err(DatabaseError) if database errors occur while deleting topic
   */
  updateTopicById = (updatedTopic: {
    id: number
    name: string
    description: string
    parentId: number | null
  }): ResultAsync<number, DatabaseError> => {
    return ResultAsync.fromPromise(
      this.Topic.update(
        {
          name: updatedTopic.name,
          description: updatedTopic.description,
          parentId: updatedTopic.parentId,
        },
        { where: { id: updatedTopic.id } },
      ),
      (error) => {
        logger.error({
          message: 'Database error while updating single topic by id',
          meta: {
            function: 'updatedTopicById',
            updatedTopic,
          },
          error,
        })
        return new DatabaseError()
      },
    ).andThen((res) => {
      return okAsync(res[0])
    })
  }
}
