import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import clsx from 'clsx'

import { handleError } from 'utils/error-handler'
import { OtcService } from 'wip/services/otc'
import { getOtcFx, getPairsOtcFx } from 'model/otc'

import { OtcStepContacts } from './otc-step-contacts'
import { OtcStepSuccess } from './otc-step-success'
import { OtcStepSummary } from './otc-step-summary'
import { FromAndToAsset, OtcStepTradeDetails } from './otc-step-trade-details'
import { StepProgressOtc } from './step-progress-otc'
import styles from './styles.module.scss'

export type StepType = {
  label: string
  id: string
  value: number
}

export type ConfigStepType = {
  [key: string]: StepType
}

export const STEPS_OTC = {
  TRADE_DETAILS: 'TRADE_DETAILS',
  CONSTANTS: 'CONSTANTS',
  SUMMARY: 'SUMMARY',
  SUCCESS: 'SUCCESS',
}

const configStep = {
  TRADE_DETAILS: {
    label: 'Trade Details',
    id: STEPS_OTC.TRADE_DETAILS,
    value: 1,
  },
  CONSTANTS: {
    label: 'Contacts',
    id: STEPS_OTC.CONSTANTS,
    value: 2,
  },
  SUMMARY: {
    label: 'Summary',
    id: STEPS_OTC.SUMMARY,
    value: 3,
  },
  SUCCESS: {
    label: 'Success',
    id: STEPS_OTC.SUCCESS,
    value: 4,
  },
}

export type OtcNewRequestForm = {
  amount: string
  fromAsset: FromAndToAsset | null
  toAsset: FromAndToAsset | null
  phone: string
  email: string
  name: string
}

const defaultValues: OtcNewRequestForm = {
  amount: '',
  fromAsset: null,
  toAsset: null,
  phone: '',
  email: '',
  name: '',
}

export const OtcNewRequest = () => {
  const [step, setStep] = useState<StepType>(configStep.TRADE_DETAILS)
  const [isLoading, setIsLoading] = useState(false)

  const methods = useForm<OtcNewRequestForm>({ defaultValues })
  const {
    handleSubmit,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = methods

  const getPairsOTC = async () => {
    try {
      setIsLoading(true)
      await getPairsOtcFx()
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getPairsOTC()
  }, [])

  const fetchSubmitRequest = async () => {
    const { amount, email, fromAsset, toAsset, name, phone } = getValues()
    const assetIdFrom = fromAsset?.assetId
    const assetIdTo = toAsset?.assetId

    if (!assetIdFrom || !assetIdTo) return

    setIsLoading(true)

    const data = {
      amountFrom: amount.trim(),
      contactPhoneNumber: phone.replace(/[^\d+]/g, ''),
      contactEmailAddress: email.trim(),
      contactFullName: name.trim(),
    }

    try {
      await OtcService.submitRequest(assetIdFrom, assetIdTo, data)
      await getOtcFx()
      setStep(configStep.SUCCESS)
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep = async () => {
    if (step.id === STEPS_OTC.TRADE_DETAILS) {
      const { amount, fromAsset, toAsset } = getValues()
      if (!fromAsset || !toAsset || !amount) return //TODO refactor
      setStep(configStep.CONSTANTS)
    }
    if (step.id === STEPS_OTC.CONSTANTS) {
      setStep(configStep.SUMMARY)
    }
    if (step.id === STEPS_OTC.SUMMARY) {
      fetchSubmitRequest()
    }

    if (step.id === STEPS_OTC.SUCCESS) {
      setStep(configStep.TRADE_DETAILS)
      reset()
    }
  }

  const getButtonName = () => {
    if (step.id === STEPS_OTC.SUCCESS) {
      return 'Request New Trade'
    }
    if (step.id === STEPS_OTC.SUMMARY) {
      return 'Confirm & Submit Request'
    }
    return 'Continue'
  }

  const handleBack = () => {
    if (step.id === STEPS_OTC.CONSTANTS) {
      setStep(configStep.TRADE_DETAILS)
    }
    if (step.id === STEPS_OTC.SUMMARY) {
      setStep(configStep.CONSTANTS)
    }
  }

  const fromAsset = watch('fromAsset')
  const toAsset = watch('toAsset')

  const disabled = !fromAsset || !toAsset || !!errors.phone

  return (
    <div className={styles.contentOneWrap}>
      <div className={styles.contentOne}>
        <div className={styles.contentOneHeader}>
          {[STEPS_OTC.CONSTANTS, STEPS_OTC.SUMMARY].includes(step.id) ? (
            <div onClick={handleBack} className={styles.backBtnWrap}>
              <div className={styles.backBtnText}>{'<'} Back</div>
            </div>
          ) : null}

          {[STEPS_OTC.TRADE_DETAILS, STEPS_OTC.SUCCESS].includes(step.id) ? (
            <div className={styles.contentOneHeaderTitle}>New Request</div>
          ) : null}
        </div>

        <div className={styles.horizontalLine} />
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(handleStep)}
            className={clsx(styles.contentOneSection, { [styles.contentOneSectionFix]: step.id === STEPS_OTC.SUCCESS })}
          >
            <div
              className={clsx(styles.stepFormWrapper, {
                [styles.stepFormWrapperFix]: step.id === STEPS_OTC.SUCCESS,
              })}
            >
              {[STEPS_OTC.TRADE_DETAILS, STEPS_OTC.CONSTANTS, STEPS_OTC.SUMMARY].includes(step.id) ? (
                <StepProgressOtc configStep={configStep} currentStep={step.id} />
              ) : null}

              {step.id === STEPS_OTC.TRADE_DETAILS ? <OtcStepTradeDetails methods={methods} /> : null}

              {step.id === STEPS_OTC.CONSTANTS ? <OtcStepContacts methods={methods} /> : null}

              {step.id === STEPS_OTC.SUMMARY ? <OtcStepSummary formData={getValues()} /> : null}

              {step.id === STEPS_OTC.SUCCESS ? <OtcStepSuccess /> : null}
            </div>

            {errors.amount ? <div className={styles.minAmoutErrorText}>{errors.amount.message}</div> : null}
            <button
              type='submit'
              className={clsx('btn', 'btn-primary', styles.submitBtnText, { [styles.btnDisabled]: disabled })}
              style={{ minHeight: 50 }}
              disabled={disabled}
            >
              {isLoading ? <span className='spinner-border' /> : getButtonName()}
            </button>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
