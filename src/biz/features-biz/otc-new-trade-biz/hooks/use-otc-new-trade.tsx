import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { handleError } from 'utils/error-handler'
import { OtcService } from 'wip/services/otc'
import { getPairsOtcFx } from 'model/otc'

import { CONFIG_STEP, OtcNewRequestForm, STEPS_OTC } from '../typeAndConstant'

const defaultValues: OtcNewRequestForm = {
  //TODO дубликат
  amount: '',
  fromAsset: null,
  toAsset: null,
  phone: '',
  email: '',
  name: '',
}

export const useOtcRequest = () => {
  const [step, setStep] = useState(CONFIG_STEP.TRADE_DETAILS)
  const [isLoading, setIsLoading] = useState(false)
  const methods = useForm<OtcNewRequestForm>({ defaultValues })

  const {
    handleSubmit,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = methods

  useEffect(() => {
    const fetchPairsOTC = async () => {
      try {
        setIsLoading(true)
        await getPairsOtcFx()
      } catch (error) {
        handleError(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPairsOTC()
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
      // await getOtcFx() //TODO установить для старго OTC
      setStep(CONFIG_STEP.SUCCESS)
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep = async () => {
    if (step.id === STEPS_OTC.TRADE_DETAILS) {
      const { amount, fromAsset, toAsset } = getValues()
      if (!fromAsset || !toAsset || !amount) return
      setStep(CONFIG_STEP.CONSTANTS)
    }
    if (step.id === STEPS_OTC.CONSTANTS) {
      setStep(CONFIG_STEP.SUMMARY)
    }
    if (step.id === STEPS_OTC.SUMMARY) {
      fetchSubmitRequest()
    }
    // // TODO не используется для нового OTC
    // if (step.id === STEPS_OTC.SUCCESS) {
    //   setStep(CONFIG_STEP.TRADE_DETAILS)
    //   reset()
    // }
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
      setStep(CONFIG_STEP.TRADE_DETAILS)
    }
    if (step.id === STEPS_OTC.SUMMARY) {
      setStep(CONFIG_STEP.CONSTANTS)
    }
  }

  const fromAsset = watch('fromAsset')
  const toAsset = watch('toAsset')
  const disabled = !fromAsset || !toAsset

  return {
    handleSubmit,
    step,
    setStep,
    isLoading,
    methods,
    handleStep,
    getButtonName,
    handleBack,
    errors,
    disabled,
  }
}
