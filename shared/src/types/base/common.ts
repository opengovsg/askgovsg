import { z } from 'zod'

export const SequelizeTimestamps = z.object({
  // createdAt and updatedAt are of type Date
  // in the backend, but are received by the frontend
  // as strings because
  // typeof JSON.parse(JSON.stringify(new Date())) === 'string'
  // To convert (string | Date) to Date, simply call new Date()
  // on the string/Date
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
})

export const BaseModel = SequelizeTimestamps.extend({
  id: z.number(),
})
