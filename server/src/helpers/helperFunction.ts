const responseHandler = (
  success: boolean,
  code = 400,
  message = 'valid',
  data: any,
): {
  success: boolean
  code: number
  message: string
  data: any
} => {
  return {
    success,
    code,
    message,
    data,
  }
}

const helperFunction = {
  responseHandler,
}

export default helperFunction
