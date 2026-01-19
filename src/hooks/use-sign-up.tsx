import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { handleError } from 'utils/error-handler'
import { AuthResponse, AuthServiceV4, MFAAddAuthResponse, StepUpAuthResponse } from 'wip/services'
import { isXanova } from 'config'

import { useCaptcha } from './use-captcha'

type Inputs = {
  email: string
  password: string
  repeatPassword: string
  checkBox: boolean
  referral: string
}

const defaultValues = {
  email: '',
  password: '',
  repeatPassword: '',
  checkBox: false,
  referral: '',
}

type PasswordHintRule = {
  id: string
  label: string
  validators: string[]
}

type PasswordHintStatus = 'idle' | 'error' | 'success'

type PasswordHint = PasswordHintRule & { status: PasswordHintStatus }

const DEFAULT_HINT_RULES: PasswordHintRule[] = [
  { id: 'minLength', label: 'Min 8 characters', validators: ['Min 8 characters'] },
  { id: 'upper', label: 'One Uppercase', validators: ['One Uppercase'] },
  { id: 'lower', label: 'One Lowercase', validators: ['One Lowercase'] },
  { id: 'number', label: 'One Number', validators: ['One Number'] },
  { id: 'symbol', label: 'One Sign', validators: ['One Sign'] },
]

const XENOVA_HINT_RULES: PasswordHintRule[] = [
  { id: 'minLength', label: 'Be at least 8 characters long', validators: ['Min 8 characters'] },
  {
    id: 'mixedCase',
    label: 'Have at least one uppercase and lowercase',
    validators: ['One Uppercase', 'One Lowercase'],
  },
  { id: 'numberSymbol', label: 'Have at least one number and one sign', validators: ['One Number', 'One Sign'] },
]

type UseSignUpDefaults = Partial<typeof defaultValues>

export const useSignUp = (initialValues?: UseSignUpDefaults) => {
  // const navigate = useNavigate()
  const methods = useForm<Inputs>({
    defaultValues: { ...defaultValues, ...initialValues },
    mode: 'onChange',
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
    setValue,
    setError,
    watch,
    clearErrors,
  } = methods

  const {
    handleVerify,
    handleResetTurnstile,
    handleLoad,
    isShowWidget,
    isDisableBtnCaptcha,
    customHeaderData,
    isCaptchaOff,
  } = useCaptcha()

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordIsFocus, setPasswordIsFocus] = useState(false)

  const [response, setResponse] = useState<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null>(null)

  const hintRules = isXanova ? XENOVA_HINT_RULES : DEFAULT_HINT_RULES

  const watchedPassword = watch('password')
  const passwordErrorMessage = typeof errors.password?.message === 'string' ? errors.password.message : ''

  const resolveHintStatus = (rule: PasswordHintRule): PasswordHintStatus => {
    if (!watchedPassword) {
      return 'idle'
    }

    if (!passwordErrorMessage) {
      return 'success'
    }

    return rule.validators.some(message => passwordErrorMessage.includes(message)) ? 'error' : 'success'
  }

  const passwordHints: PasswordHint[] = hintRules.map(rule => ({
    ...rule,
    status: resolveHintStatus(rule),
  }))

  const passwordHintMessages = hintRules.flatMap(rule => rule.validators)

  const toggleShowPassword = () => setShowPassword(prev => !prev)

  const toggleShowConfirmPassword = () => setShowConfirmPassword(prev => !prev)

  const isSamePassword = (repeatPassword: string): boolean => {
    const password = getValues('password')
    return repeatPassword === password
  }

  const onSubmit: SubmitHandler<Inputs> = async data => {
    setLoading(true)

    try {
      const responseData = await AuthServiceV4.emailSignUp(
        {
          password: data.password,
          email: data.email,
          referral: (data.referral || '').trim(),
        },
        customHeaderData
      )

      setResponse(responseData)
    } catch (error: any) {
      console.error('ERROR-signUp', error)

      handleResetTurnstile()

      const errorMessage = handleError(error, true)
      errorMessage && setError('email', { type: 'exist', message: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return {
    methods,
    register,
    handleSubmit,
    errors,
    passwordHints,
    passwordHintMessages,
    loading,
    showPassword,
    showConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    onSubmit,
    isSamePassword,
    passwordIsFocus,
    setPasswordIsFocus,
    trigger,
    setValue,
    watch,
    // navigate,
    response,
    setResponse,
    setLoading,
    handleVerify,
    handleResetTurnstile,
    isShowWidget,
    isDisableBtnCaptcha,
    isCaptchaOff,
    handleLoad,
    clearErrors,
  }
}
