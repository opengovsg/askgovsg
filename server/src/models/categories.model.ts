import { Sequelize, DataTypes, Model, ModelCtor } from 'sequelize'
import { Category as CategoryBaseDto } from '~shared/types/base'
import { Agency } from './agencies.model'

export interface Category extends Model, CategoryBaseDto {}

//constructor
export const defineCategory = (
  sequelize: Sequelize,
  { Agency }: { Agency: ModelCtor<Agency> },
): ModelCtor<Category> => {
  const Category: ModelCtor<Category> = sequelize.define('category', {
    catname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  })

  // Define associations for category
  Agency.hasMany(Category)
  Category.belongsTo(Agency)
  Category.hasMany(Category, { foreignKey: 'parentId' })
  Category.belongsTo(Category)

  return Category
}
