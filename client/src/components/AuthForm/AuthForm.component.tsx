import axios, { AxiosError } from 'axios'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { getApiErrorMessage } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import * as AuthService from '../../services/AuthService'
import Spinner from '../Spinner/Spinner.component'
import { useStyledToast } from '../StyledToast/StyledToast'
import './AuthForm.styles.scss'

const OtpState = {
  Initial: 0,
  Requested: 1,
  Sent: 2,
}

type FormValues = {
  email: string
  otp: string
}

const AuthForm = (): JSX.Element => {
  const toast = useStyledToast()
  const { register, handleSubmit, getValues, reset } = useForm<FormValues>()
  const [otpState, setOtpState] = useState(OtpState.Initial)
  const auth = useAuth()

  const sendOtp = useMutation(AuthService.sendOtp, {
    onSuccess: () => {
      setOtpState(OtpState.Sent)
      toast({
        status: 'success',
        description: 'OTP sent',
      })
    },
    onError: (error) => {
      toast({
        status: 'error',
        description: getApiErrorMessage(error),
      })
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (otpState === OtpState.Sent) {
      auth.verifyOtp.mutate(data, {
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            const data = (error as AxiosError<{ message: string }>).response
              ?.data || { message: undefined }
            if (
              data.message ===
              'You have hit the max number of attempts. Please request for a new OTP.'
            ) {
              setOtpState(0)
            }
          }
          toast({
            status: 'error',
            description: getApiErrorMessage(error),
          })
        },
      })
      reset({ ...getValues(), otp: '' })
    } else {
      setOtpState(OtpState.Requested)
      sendOtp.mutate(data.email)
    }
  }

  let OtpComponent = null
  if (otpState === OtpState.Sent) {
    OtpComponent = (
      <>
        <label className="form-label">One-Time Password</label>
        <input
          className="form-input"
          placeholder="Enter OTP sent to your email"
          {...register('otp', { required: true, minLength: 6, maxLength: 6 })}
        />
      </>
    )
  } else if (otpState === OtpState.Requested) {
    OtpComponent = <Spinner centerHeight="50px" />
  }

  const contactComponent = (
    <>
      <label className="form-label">Email</label>
      <input
        className="form-input"
        placeholder="e.g. jane@mail.com"
        {...register('email', { required: true })}
      />
    </>
  )

  return (
    <div className="form-container">
      <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
        {contactComponent}
        {OtpComponent}
        <input
          id="submit-button"
          name="submit-button"
          type="submit"
          value={otpState === OtpState.Sent ? 'Log In' : 'Send OTP'}
        />
      </form>
    </div>
  )
}

export default AuthForm
