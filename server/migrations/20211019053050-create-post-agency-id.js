'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('posts', 'agencyId', {
      allowNull: true,
      type: Sequelize.INTEGER,
      references: {
        model: 'agencies',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('posts', 'agencyId')
  },
}
