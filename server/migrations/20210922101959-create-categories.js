'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('categories', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      catname: {
        type: Sequelize.TEXT,
        allowNull: false,
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
        allowNull: true, //to change to false once we implement this across all agencies
        type: Sequelize.INTEGER,
        references: {
          model: 'agencies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', //Cascade?
      },
      parentId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', //Cascade?
      },
    })
  },

  down: async (queryInterface) => {
    return queryInterface.dropTable('categories')
  },
}
