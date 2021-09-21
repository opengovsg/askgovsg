import { Model, ModelCtor } from 'sequelize'

export type ModelDef<M, C = M> = ModelCtor<Model<M, C> & M>
