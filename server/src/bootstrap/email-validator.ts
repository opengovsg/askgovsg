import minimatch from 'minimatch'
import { authConfig } from './config/auth'

export const emailValidator = new minimatch.Minimatch(authConfig.govEmailGlob, {
  noext: false,
  noglobstar: true,
  nobrace: true,
  nonegate: true,
})
