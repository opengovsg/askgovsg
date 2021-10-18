import { ControllerHandler } from '../../types/response-handler'
import { createLogger } from '../../bootstrap/logging'
import { FileService } from './file.service'
import { StatusCodes } from 'http-status-codes'

const logger = createLogger(module)

export class FileController {
  private fileService: Public<FileService>

  constructor({ fileService }: { fileService: Public<FileService> }) {
    this.fileService = fileService
  }

  /**
   * Uploads a file
   * @returns 200 if the file is successfully uploaded
   * @returns 400 if there is no file specified
   * @returns 400 if there are any other errors
   */
  upload: ControllerHandler = async (req, res) => {
    const { file } = req

    if (!file) {
      const message = 'No file uploaded'
      logger.error({
        message,
        meta: {
          function: 'upload',
        },
      })
      return res.status(StatusCodes.BAD_REQUEST).json({ message })
    }
    try {
      const response = await this.fileService.upload({
        name: file.originalname,
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.size,
      })
      return res.status(StatusCodes.OK).json(response)
    } catch (error) {
      if (error instanceof Error) {
        const message = error.message
        logger.error({
          message,
          meta: {
            function: 'upload',
          },
          error,
        })
        return res.status(StatusCodes.BAD_REQUEST).json({ message })
      }
    }
  }
}
