'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('agencies', 'displayOrder', {
      type: Sequelize.JSON,
      allowNull: true,
    })
  },

  down: async (queryInterface) => {
    queryInterface.removeColumn('agencies', 'displayOrder')
  },
}
