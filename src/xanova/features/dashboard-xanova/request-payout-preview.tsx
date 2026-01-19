import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { pages } from 'constant'
import {
  requestPayoutFormEv,
  requestPayoutFormResetEv,
  type RequestPayoutFormValues,
  type RequestPayoutMethod,
} from 'model'
import { $membershipStatus } from 'model/membership-status'

import { DEFAULT_PAYOUT_METHOD_OPTION, REQUEST_PAYOUT_METHODS } from '../../constants/request-payout-methods'
import styles from './styles.module.scss'
import { useCurrentBreakpointXanova } from 'hooks/use-current-breakpoint-xanova'

type RequestPayoutPreviewValues = {
  amount: string
  method: RequestPayoutMethod | ''
  assetId: string
}

const DEFAULT_VALUES: RequestPayoutPreviewValues = {
  amount: '',
  method: DEFAULT_PAYOUT_METHOD_OPTION?.method ?? 'crypto',
  assetId: DEFAULT_PAYOUT_METHOD_OPTION?.assetId ?? '',
}

export function RequestPayoutPreview() {
  const navigate = useNavigate()
  const { isDesktopXanova } = useCurrentBreakpointXanova()

  const [patchForm, resetForm] = useUnit([requestPayoutFormEv, requestPayoutFormResetEv])
  const membershipStatus = useUnit($membershipStatus)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RequestPayoutPreviewValues>({
    defaultValues: DEFAULT_VALUES,
  })

  const selectedAssetId = watch('assetId')

  useEffect(() => {
    reset(DEFAULT_VALUES)
    resetForm()
  }, [reset, resetForm])

  const handleOnSubmit = ({ amount, method, assetId }: RequestPayoutPreviewValues) => {
    if (!method || !assetId) return

    patchForm({
      amount,
      method: method as RequestPayoutMethod,
      assetId,
    } as Partial<RequestPayoutFormValues>)

    navigate(pages.REQUEST_PAYOUT.path)
  }

  return (
    <form className={clsx(styles.gridBlock, styles.bottomRightWidget)} onSubmit={handleSubmit(handleOnSubmit)}>
      <h4 className={clsx(styles.title, styles.colorWhite)}>Request Payout</h4>

      <div className='input-wrap-xanova white'>
        <label htmlFor='amount' className={errors.amount ? 'text-error' : ''}>
          {errors.amount ? '' : 'Amount'}
          {errors.amount && errors.amount.type === 'pattern' ? 'Invalid' : errors.amount?.message}
          {errors.amount && errors.amount.type === 'required' ? 'Required' : ''}
        </label>
        <input
          id='amount'
          type='text'
          className={errors.amount ? 'error' : ''}
          placeholder='Type here..'
          {...register('amount', {
            required: true,
            setValueAs: value => (typeof value === 'string' ? value.trim() : ''),
            max: {
              value: +(membershipStatus.availableCommissions || Infinity),
              message: 'Insufficient balance',
            },

            validate: value => (!!value && Number(value) > 0 ? true : 'Invalid amount'),
            onChange: event => {
              const value = event.target.value
              setValue('amount', value.replace(',', '.'), { shouldValidate: true })
            },
          })}
        />
        <span className='currency'>$</span>
      </div>

      <div className={styles.flexVerticalGap20}>
        <div className={styles.inputLabel}>Method</div>
        <div className={styles.flexHorizontalGap24}>
          <input type='hidden' {...register('method', { required: true })} />
          {REQUEST_PAYOUT_METHODS.map(methodOption => (
            <label
              key={methodOption.assetId}
              className={clsx('radio-wrap-xanova white')}
              htmlFor={`deposit-method-${methodOption.assetId}`}
            >
              <input
                {...register('assetId', { required: true })}
                id={`deposit-method-${methodOption.assetId}`}
                type='radio'
                value={methodOption.assetId}
                checked={selectedAssetId === methodOption.assetId}
                onChange={() => {
                  setValue('assetId', methodOption.assetId, { shouldValidate: true })
                  setValue('method', methodOption.method, { shouldValidate: true })
                }}
                disabled={methodOption.disabled}
              />
              <span className='radio-xanova-box' />
              <span className='radio-xanova-text'>{methodOption.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button type='submit' className='btn-xanova gold'>
        Request
      </button>
    </form>
  )
}
