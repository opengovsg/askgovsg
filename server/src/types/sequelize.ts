import { Model, ModelCtor } from 'sequelize'

export type ModelDef<
  M,
  C = Omit<M, 'createdAt' | 'updatedAt' | 'id'>,
> = ModelCtor<Model<M, C> & M>
