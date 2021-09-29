'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('tokens', 'attempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
    })
  },

  down: async (queryInterface) => {
    queryInterface.removeColumn('tokens', 'attempts')
  },
}
