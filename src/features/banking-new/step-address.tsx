import { useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import clsx from 'clsx'

import { ErrorRedBlock } from 'components'
import { CardService } from 'wip/services'
import { ErrorInfoIcon } from 'icons/error-info-icon'
import { getCardStatusFx } from 'model/cefi-banking'

import styles from './styles.module.scss'

type Inputs = {
  addressLine1: string
  addressLine2: string
  city: string
  zipCode: string
}

const defaultValues = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  zipCode: '',
}

export function StepAddress() {
  const methods = useForm<Inputs>({ defaultValues, mode: 'onChange' })
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = methods

  const watchAddressLine1 = watch('addressLine1')
  const watchAddressLine2 = watch('addressLine2')
  const watchCity = watch('city')
  const watchZipCode = watch('zipCode')

  const [loading, setLoading] = useState(false)
  const [requestError, setRequestError] = useState('')

  const onSubmit: SubmitHandler<Inputs> = async () => {
    setLoading(true)
    try {
      const addressStep = await CardService.setOrderCardAddress({
        address1: watchAddressLine1,
        address2: watchAddressLine2,
        city: watchCity,
        postalCode: watchZipCode,
      })

      await getCardStatusFx()
    } catch (e: any) {
      console.log('ERROR-PhoneService. | ADDRESS', e)
      setRequestError(e.code || 'submitOrderStatus(ADDRESS)-ERROR')
    }
    setLoading(false)
  }

  const validateField = (value: string) => {
    const allowedCharactersRegex =
      /^[a-z0-9æäåáéíøöóõšüúžàèìòùâêîôûãñëïÿėçćńśźāēīōūąęįųčģķļņŗỳǹẁýǵḱĺḿṕŕẃŷĉĝĥĵŝŵẑẽĩũỹṽḧẅẍẗẘẙȳḡăĕĭŏŭğǫǎěǐǒǔďǧȟǰǩľňřťȩḑḩşţőűůǖǘǚǜ'-/.,& ]+$/i

    if (!value) {
      return true
    }

    const invalidCharacters = value.split('').filter(char => !allowedCharactersRegex.test(char))

    if (invalidCharacters.length > 0) {
      return `Contains invalid characters: ${invalidCharacters.join(', ')}`
    }

    return true
  }

  return (
    <FormProvider {...methods}>
      <form className={styles.stepContentContainer} onSubmit={handleSubmit(onSubmit)}>
        <div className={clsx(styles.freeHistoryDescription, styles.freeHistoryDescriptionThree)}>
          Please fill in or confirm your address details below. This is important, as we&#39;ll use this information to
          securely send your HODL Card.
        </div>
        <div className={styles.stepAddressContainer}>
          <div className={styles.addressTwoFieldsWrap}>
            <div className='input-item-wrap-new'>
              <label htmlFor='city' className={`input-label ${errors.city ? 'text-error' : ''}`}>
                City
              </label>
              <input
                id='city'
                type='text'
                className={clsx('input-form', errors.city ? 'error' : '')}
                placeholder='City'
                {...register('city', {
                  required: true,
                  validate: validateField,
                  maxLength: { value: 35, message: 'City Name Too Long' },
                })}
              />
              {errors.city?.message ? (
                <div className={styles.errorBox}>
                  <ErrorInfoIcon />
                  {errors.city?.message}
                </div>
              ) : null}
            </div>

            <div className='input-item-wrap-new'>
              <label htmlFor='zipCode' className={`input-label ${errors.zipCode ? 'text-error' : ''}`}>
                Zip Code
              </label>
              <input
                id='zipCode'
                type='text'
                className={clsx('input-form', errors.zipCode ? 'error' : '')}
                placeholder='Zip Code'
                {...register('zipCode', { required: true, maxLength: { value: 10, message: 'Zip Code Too Long' } })}
              />
              {errors.zipCode?.message ? (
                <div className={styles.errorBox}>
                  <ErrorInfoIcon />
                  {errors.zipCode?.message}
                </div>
              ) : null}
            </div>
          </div>

          <div className='input-item-wrap-new'>
            <label htmlFor='addressLine1' className={`input-label ${errors.addressLine1 ? 'text-error' : ''}`}>
              Address Line 1
            </label>
            <input
              id='addressLine1'
              type='text'
              className={clsx('input-form', errors.addressLine1 ? 'error' : '')}
              placeholder='Address Line 1'
              {...register('addressLine1', {
                required: true,
                validate: validateField,
                maxLength: { value: 45, message: 'Address Too Long' },
              })}
            />
            {errors.addressLine1?.message ? (
              <div className={styles.errorBox}>
                <ErrorInfoIcon />
                {errors.addressLine1?.message}
              </div>
            ) : null}
          </div>

          <div className='input-item-wrap-new'>
            <label htmlFor='addressLine2' className={`input-label ${errors.addressLine2 ? 'text-error' : ''}`}>
              Address Line 2 (Optional)
            </label>
            <input
              id='addressLine2'
              type='text'
              className={clsx('input-form', errors.addressLine2 ? 'error' : '')}
              placeholder='Address Line 2 (Optional)'
              {...register('addressLine2', {
                validate: validateField,
                maxLength: { value: 45, message: 'Address Too Long' },
              })}
            />
            {errors.addressLine2?.message ? (
              <div className={styles.errorBox}>
                <ErrorInfoIcon />
                {errors.addressLine2?.message}
              </div>
            ) : null}
          </div>

          <div className={styles.stepThreeBtnWrap}>
            <button
              type='submit'
              className={clsx('btn-new primary big', !isValid || loading ? 'disabled' : '')}
              disabled={!isValid || loading}
            >
              {loading ? <span className='spinner-border' /> : <div>Next</div>}
            </button>

            {requestError ? <ErrorRedBlock requestError={requestError} /> : null}
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
