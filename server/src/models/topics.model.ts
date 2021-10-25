import { Sequelize, DataTypes } from 'sequelize'
import { Topic, Agency } from '~shared/types/base'
import { ModelDef } from '../types/sequelize'

//constructor
export const defineTopic = (
  sequelize: Sequelize,
  { Agency }: { Agency: ModelDef<Agency> },
): ModelDef<Topic> => {
  const Topic: ModelDef<Topic> = sequelize.define('topic', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  })

  // Define associations for topic
  Agency.hasMany(Topic)
  Topic.belongsTo(Agency)
  Topic.hasMany(Topic, { foreignKey: 'parentId' })
  Topic.belongsTo(Topic, { foreignKey: 'parentId' })

  return Topic
}
