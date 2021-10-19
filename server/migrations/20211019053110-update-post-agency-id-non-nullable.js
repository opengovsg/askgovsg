'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('posts', 'agencyId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('posts', 'agencyId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })
  },
}
