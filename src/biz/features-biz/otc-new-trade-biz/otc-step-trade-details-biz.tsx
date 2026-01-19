import { UseFormReturn } from 'react-hook-form'
import clsx from 'clsx'

import { CommonDropdownBiz } from 'components/common-dropdown-biz'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'

import { useOtcAssets } from './hooks/use-otc-assets'
import styles from './styles.module.scss'
import { OtcNewRequestForm } from './typeAndConstant'

type Props = {
  methods: any
}

export type FromAndToAsset = {
  assetId: string
  icon: string
  minimalAmount: string
  availableBalance: string
}

export const OtcStepTradeDetailsBiz = ({ methods }: Props) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    clearErrors,
  } = methods

  const watchFromAsset = watch('fromAsset')
  const watchToAsset = watch('toAsset')

  const { fromAssetsState, toAssetsState, minAmount } = useOtcAssets(watchFromAsset, watchToAsset)

  const fromAssetId = watchFromAsset?.assetId

  const handleSetMaxAmount = () => {
    setValue('amount', watchFromAsset?.availableBalance ? watchFromAsset?.availableBalance.toString() : '')
    clearErrors()
  }

  const itemComponent = (item: FromAndToAsset) => {
    return (
      <div>
        {item ? (
          <div className={styles.itemComponent}>
            <img src={item.icon} className={styles.icon} alt='' />
            {item?.assetId}
          </div>
        ) : (
          <div className={styles.itemComponentPlaceholder}>Choose from the list</div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.stepOneContainer}>
      <div className={styles.assetSelection}>
        <div className={styles.assetSelectionItem}>
          <div className={styles.inputLabel}>From</div>
          <CommonDropdownBiz
            data={fromAssetsState}
            itemComponent={itemComponent}
            setSelectedData={value => setValue('fromAsset', value)}
            selectedData={watchFromAsset}
            isClearButton={true}
            showDropdownForSingleItem={true}
          />
        </div>

        <div className={styles.assetSelectionItem}>
          <div className={styles.inputLabel}>To</div>
          <CommonDropdownBiz
            data={toAssetsState}
            itemComponent={itemComponent}
            setSelectedData={value => setValue('toAsset', value)}
            selectedData={watchToAsset}
            isClearButton={true}
            showDropdownForSingleItem={true}
          />
        </div>
      </div>

      {watchFromAsset && watchToAsset ? (
        <div className={styles.amountContainer}>
          <div className={clsx(styles.inputLabel, { [styles.colorRed]: errors.amount })}>You Send</div>
          <div className='input-item-wrap-biz'>
            <input
              style={{
                ...(errors.amount ? { border: '1px solid red' } : {}),
              }}
              id='amount'
              type='text'
              className={clsx('input-form', { [styles.inputError]: errors.amount })}
              placeholder={`Min Amount  ${+minAmount} ${fromAssetId}`}
              {...register('amount', {
                required: 'Amount is required',
                min: {
                  value: minAmount,
                  message: `The amount entered is below the required minimum of ${+minAmount} ${fromAssetId}`,
                },
                onChange(event: any) {
                  const value = event.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
                  setValue('amount', value.trim())
                },
                validate: (value: any) => {
                  if (!/^\d*\.?\d*$/.test(value)) {
                    return 'Please enter a valid number (integer or decimal)'
                  }
                  return true
                },
              })}
              onKeyDown={e => {
                if (
                  !/[0-9.,]/.test(e.key) &&
                  e.key !== 'Backspace' &&
                  e.key !== 'ArrowLeft' &&
                  e.key !== 'ArrowRight' &&
                  e.key !== 'Delete' &&
                  e.key !== 'Tab'
                ) {
                  e.preventDefault()
                }
              }}
            />
            <div onClick={handleSetMaxAmount} className={styles.addressBookIconWrap}>
              <div className={styles.inputAsset}>{watchFromAsset?.assetId}</div>
              <div className={styles.inputMax}>MAX</div>
            </div>
          </div>

          {watchFromAsset ? (
            <div className={styles.availableBalanceWrap}>
              <p className={styles.availableBalance}>
                Balance:{addCommasToDisplayValue(watchFromAsset?.availableBalance.toString() || '0')}{' '}
                {watchFromAsset?.assetId}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
