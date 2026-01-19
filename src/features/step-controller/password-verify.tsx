import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import clsx from 'clsx'

import eye from 'assets/icons/eye.svg'
import eyeOff from 'assets/icons/eye-off.svg'

import { ErrorView } from './error-view'
import styles from './styles.module.scss'

type Inputs = {
  code: string
}
const defaultValues = {
  code: '',
}

type Props = {
  action: (confirmationCode: string) => Promise<void>
  errorMessage: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
}

export const PasswordVerify = ({ action, errorMessage, isLoading, setErrorMessage }: Props) => {
  const { handleSubmit, watch, register, reset } = useForm<Inputs>({ defaultValues })

  const inputValue = watch('code')

  const [showPassword, setShowPassword] = useState(false)

  const toggleShowPassword = (): void => {
    setShowPassword(prevState => !prevState)
  }

  useEffect(() => {
    errorMessage && setErrorMessage('')
  }, [inputValue])

  const handleAction = (inputData: Inputs) => {
    setErrorMessage('')

    action(inputData.code)
  }

  return (
    <form onSubmit={handleSubmit(handleAction)} className={clsx(styles.formWrap, styles.formWrapModal)}>
      <div className={clsx(styles.description, styles.descriptionModal)}>Please enter your account password.</div>

      <div className={clsx(styles.codeInputWrap, styles.width100)}>
        <div className='input-item-wrap-new'>
          <label htmlFor='code' className={'input-label'}>
            Password
          </label>

          <input
            className='input-form'
            type={showPassword ? 'text' : 'password'}
            style={errorMessage ? { border: '1px solid red' } : {}}
            placeholder='Enter your password here'
            {...register('code', { required: true })}
          />

          <div onClick={toggleShowPassword}>
            <img src={showPassword ? eyeOff : eye} alt='' className='icon-eye' style={{ top: '64%' }} />
          </div>
        </div>
        <ErrorView errorMessage={errorMessage} />
      </div>

      <div></div>

      <div className={styles.button}>
        <button
          type='submit'
          className={clsx('btn-new primary' /* no big for modal */, !inputValue ? styles.buttonDisable : {})}
          disabled={isLoading || !inputValue}
        >
          {isLoading ? <span className='spinner-border' /> : 'Next'}
        </button>
      </div>
    </form>
  )
}
