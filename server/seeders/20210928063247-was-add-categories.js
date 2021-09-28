'use strict'

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('categories', [
      {
        id: 1,
        catname: 'cat1',
        agencyId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        catname: 'cat1a',
        agencyId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: 1,
      },
      {
        id: 3,
        catname: 'cat1b',
        agencyId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: 1,
      },
      {
        id: 4,
        catname: 'cat1aa',
        agencyId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: 2,
      },
    ])

    //Add category Ids to posts
    await queryInterface.sequelize.query(
      'UPDATE posts SET categoryId = 1 WHERE id = 14',
    )
    await queryInterface.sequelize.query(
      'UPDATE posts SET categoryId = 2 WHERE id = 15',
    )
    await queryInterface.sequelize.query(
      'UPDATE posts SET categoryId = 3 WHERE id = 16',
    )
    await queryInterface.sequelize.query(
      'UPDATE posts SET categoryId = 4 WHERE id = 17',
    )
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categories', null, {})
  },
}
