import React from 'react'
import { UseFormReturn } from 'react-hook-form'

import { Modal } from '../../../components'
import { STEP_UP_SCOPE } from '../../../constant/step-up-scope'
import { handleError } from '../../../utils/error-handler'
import { validateStepUpAvailability } from '../../../utils/validate-step-up-availability'
import { AuthResponse, MFAAddAuthResponse, StepUpAuthResponse } from '../../../wip/services'
import styles from './styles.module.scss'

type Inputs = {
  amount: string
  address: string
  memo: string
  checkBox: boolean
  addressName: string
  twoFaCode: string
  emailCode: string
  phoneCode: string
}

type Props = {
  methods: any
  setResponse: React.Dispatch<
    React.SetStateAction<AuthResponse | StepUpAuthResponse | MFAAddAuthResponse | null | undefined>
  >
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  isLoading: boolean
}

export function AddressNameModal({ methods, setResponse, setIsLoading, isLoading }: Props) {
  const {
    formState: { errors },
    register,
    getValues,
  } = methods

  const handleAddAddress = async () => {
    setIsLoading(true)
    try {
      const stepUpRes = await validateStepUpAvailability(STEP_UP_SCOPE.WITHDRAWAL)
      stepUpRes && setResponse(stepUpRes)
      Modal.close()
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.containerModal}>
      <div className={styles.title}>Name Whitelist Address</div>
      <div className={styles.description}>
        Before proceeding with your transaction, please name your whitelist address to easily locate it in your
        whitelist
      </div>
      <div style={{ height: 53 }} />
      <div className='input-item-wrap-new'>
        <label htmlFor='addressName' className={`input-label ${errors.memo ? 'text-error' : ''}`}>
          Enter Address Name
        </label>
        <input
          id='addressName'
          type='text'
          className='input-form'
          placeholder='Enter address name'
          {...register('addressName', { required: true })}
        />
      </div>

      <button
        // type='submit'
        className='btn-new primary big'
        // style={btnDisableColor() ? { opacity: 0.4 } : {}}
        // disabled={btnDisable()}
        style={{ marginTop: 'auto' }}
        onClick={handleAddAddress}
      >
        {isLoading ? <span className='spinner-border' /> : 'Save & Continue Withdrawal'}
      </button>
    </div>
  )
}
