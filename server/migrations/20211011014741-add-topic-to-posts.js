'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('posts', 'topicId', {
      allowNull: true, //to change to false once we implement this across all agencies
      type: Sequelize.INTEGER,
      references: {
        model: 'topics',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('posts', 'topicId')
  },
}
