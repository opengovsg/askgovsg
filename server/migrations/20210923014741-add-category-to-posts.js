'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('posts', 'categoryId', {
      allowNull: true, //to change to false once we implement this across all agencies
      type: Sequelize.INTEGER,
      references: {
        model: 'categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('posts', 'agencyId')
  },
}
