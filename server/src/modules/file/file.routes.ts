import express from 'express'
import multer from 'multer'
import { FileController } from './file.controller'
import { AuthMiddleware } from '../auth/auth.middleware'

export const routeFiles = ({
  controller,
  authMiddleware,
  maxFileSize,
}: {
  controller: FileController
  authMiddleware: Public<AuthMiddleware>
  maxFileSize: number
}): express.Router => {
  const router = express.Router()

  const storage = multer.memoryStorage()
  const upload = multer({
    storage,
    limits: {
      fileSize: maxFileSize,
    },
  })

  router.post(
    '/',
    authMiddleware.authenticate,
    upload.single('file'),
    controller.upload,
  )
  return router
}
