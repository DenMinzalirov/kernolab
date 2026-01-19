import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useUnit } from 'effector-react'

import { CommonDropdown, ErrorRedBlock } from 'components'
import { AuthResponse, AuthServiceV4, CardService, MFAAddAuthResponse, StepUpAuthResponse } from 'wip/services'
import { $cardStatus, getCardStatusFx } from 'model/cefi-banking'

import { handleError } from '../../utils/error-handler'
import { countriesArray, Country, getCountryByPhoneNumber } from '../modals/travel-rule-form/countries'
import { StepControllerComponent } from '../step-controller'
import styles from './styles.module.scss'

type Inputs = {
  phone: string
  code: string
}

export function StepPhone() {
  const cardStatus = useUnit($cardStatus)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Inputs>({
    defaultValues: {
      phone: '',
      code: '',
    },
  })

  const [loading, setLoading] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [response, setResponse] = useState<AuthResponse | MFAAddAuthResponse | StepUpAuthResponse | null>(null)

  const [selectedData, setSelectedData] = useState<Country | null>(null)

  const blockPhone = !!cardStatus?.additionalInfo?.phone
  const watchPhone = watch('phone')

  useEffect(() => {
    if (blockPhone) {
      const phoneData = getCountryByPhoneNumber(cardStatus.additionalInfo?.phone)
      phoneData && setValue('phone', phoneData.restNumber)
      phoneData && setSelectedData(phoneData.country)
    }
  }, [blockPhone])

  const nextStepToTerms = async (): Promise<void> => {
    try {
      await CardService.setOrderCardPhone()
      await getCardStatusFx()
    } catch (error: any) {
      setRequestError(error.code || 'Phone Service Error')
    }
  }

  const handleButtonClick = async (data: Inputs) => {
    setLoading(true)
    setRequestError('')

    if (blockPhone) {
      return await nextStepToTerms()
    }

    const phone = (selectedData?.phoneCode || '') + data.phone.replace(/[^+\d]/g, '')

    try {
      // send phone code
      const res = await AuthServiceV4.addPhone({ phone })

      setResponse(res)
    } catch (error: any) {
      handleError(error)
    }

    setLoading(false)
  }

  const finalAction = async () => {
    await nextStepToTerms()
  }

  const itemComponent = (data: Country) => {
    if (!data) return <div style={{ padding: 10 }}>Code</div>
    return (
      <div style={{ padding: 10 }}>
        {data.flag}&nbsp;{data.phoneCode}
      </div>
    )
  }

  return (
    <div className={styles.stepContentContainer}>
      {!response && (
        <>
          <div className={styles.freeHistoryDescription} style={{ textAlign: 'center', marginTop: 90 }}>
            {"A quick step for added security. We'll send you a verification code to ensure it's really you."}
          </div>

          <div style={{ height: 58 }} />

          <div className='input-item-wrap-new'>
            <label htmlFor='phone' className='input-label'>
              Phone Number
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <div
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  return null
                }}
              >
                <CommonDropdown
                  data={countriesArray}
                  selectedData={selectedData}
                  itemComponent={itemComponent}
                  setSelectedData={setSelectedData}
                  isDisabled={blockPhone}
                />
              </div>
              <input
                id='phone'
                type='text'
                className='input-form'
                style={errors.phone ? { border: '1px solid red' } : {}}
                placeholder='Type here..'
                {...register('phone', {
                  required: true,
                  validate: value => {
                    if (!selectedData) return 'Chose phone code.'
                    const trimmedValue = value.replace(/[^+\d]/g, '')
                    if (trimmedValue.length < 5 || trimmedValue.length > 16) {
                      return 'Phone number must be between 5 and 16 characters long.'
                    }
                  },
                  onChange(event) {
                    const cleanedValue = event.target.value?.replace(/[^0-9()\s_-]+/g, '')

                    setValue('phone', cleanedValue)
                  },
                  disabled: blockPhone,
                })}
              />
            </div>
          </div>

          <div className={styles.btnHeight} />

          <div className={styles.stepFourBtnWrap}>
            <button onClick={handleSubmit(handleButtonClick)} className='btn-new primary big'>
              {loading ? <span className='spinner-border' /> : 'Next'}
            </button>
          </div>

          {requestError ? (
            <ErrorRedBlock requestError={requestError} />
          ) : (
            <div style={{ height: 'auto', margin: '24px 0' }} />
          )}
        </>
      )}

      {response && (
        <StepControllerComponent
          nextStepResponse={response}
          finalAction={finalAction}
          dataProps={{ phone: `${selectedData?.phoneCode || ''}${watchPhone}` }}
        />
      )}
    </div>
  )
}
