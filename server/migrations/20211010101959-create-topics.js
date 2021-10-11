'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('topics', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      agencyId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'agencies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
      },
      parentId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'topics',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    })
  },

  down: async (queryInterface) => {
    return queryInterface.dropTable('topics')
  },
}
