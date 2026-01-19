import React, { useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import i18n from 'components/i18n/localize'
import { getBalanceString, roundingBalance } from 'utils'
import ChangeIcon from 'assets/icons/ChangeIcon'
import infoIconError from 'assets/icons/info-icon-error.svg'

import { $currency } from '../../model/currency'
import { addCommasToDisplayValue } from '../../utils/add-commas-to-display-value'
import styles from './styles.module.scss'

export interface InputAmount {
  errors: any
  asset: any
  register: any
  assetRate?: any
  setValue: any
  watchAmount: any
  isCurrency: any
  setIsCurrency: any
  clearErrors: any
  minAmountAsset?: string | number
}

export function InputAmount({
  errors,
  asset,
  register,
  assetRate,
  setValue,
  watchAmount,
  isCurrency,
  setIsCurrency,
  clearErrors,
  minAmountAsset = '0',
}: InputAmount) {
  const { t } = i18n
  const currency = useUnit($currency)
  const currencyType = currency.type?.toLowerCase() as 'usd' | 'eur'

  const currentPrice = asset[currencyType].price || 0

  const [isFocusAmount, setIsFocusAmount] = useState(false)

  const validateAmountCurrency = (data: string): boolean | string => {
    const amount = data.replace(',', '.')
    if (isNaN(+amount)) return 'Incorrect value'
    if (+amount <= +asset.availableBalance * currentPrice) return true

    return 'Not Enough Balance'
  }

  const validateAmountCrypto = (data: string): boolean | string => {
    const amount = data.replace(',', '.')
    if (isNaN(+amount)) return 'Incorrect value'
    if (+amount <= +asset.availableBalance) return true
    return 'Not Enough Balance!'
  }

  const handleMinBtn = (): void => {
    clearErrors()

    const minAmount = minAmountAsset ? minAmountAsset.toString() : '0'
    const newAmount = isCurrency ? currentPrice * +roundingBalance(minAmount, 8) : roundingBalance(minAmount, 8)
    setValue('amount', newAmount.toString())
  }

  const handleMaxBtn = (): void => {
    clearErrors()
    const newAmount = isCurrency
      ? currentPrice * +roundingBalance(asset.availableBalance, 8)
      : roundingBalance(asset.availableBalance, 8)
    setValue('amount', newAmount.toString())
  }

  const changeAmountCurrency = (): void => {
    let newAmount: string | number = ''
    if (isCurrency) {
      newAmount = watchAmount ? +watchAmount / currentPrice || 0 : ''
    } else if (!isCurrency) {
      newAmount = watchAmount ? +watchAmount * currentPrice : ''
    }
    setValue('amount', newAmount.toString())

    setIsCurrency((prev: any) => !prev)
  }

  return (
    <>
      <div className={styles.enterAmount} /* style={errors.amount ? { color: 'var(--P-System-Red)' } : {}} */>
        {/* {errors.amount && errors.amount.type === 'required' ? t('inputError.required') : ''} */}
        {/* {errors.amount && errors.amount.type === 'min'
          ? `Min ${addCommasToDisplayValue((+minAmountAsset)?.toString(), 3)}`
          : ''} */}
        {/* {errors.amount && errors.amount.type === 'validate' ? errors.amount.message : ''} */}
        {/* {!errors.amount && 'Amount'} */}
        Amount
      </div>
      <div
        className={clsx(styles.withdrawInput, isFocusAmount ? styles.focusAmount : '')}
        style={errors.amount ? { border: '1px solid var(--P-System-Red)' } : {}}
      >
        <div className={styles.inputBlock}>
          {isCurrency ? (
            <>
              <div onClick={changeAmountCurrency} className={styles.currencyBlock}>
                ≈ {asset.assetId}{' '}
                {watchAmount ? getBalanceString(+watchAmount / currentPrice || 0, 8) : `${+(minAmountAsset || '00')}`}
                &nbsp;
                <ChangeIcon fill='var(--P-System-Green)' width={9} height={9} />{' '}
              </div>
              <input
                placeholder={`Min ${+minAmountAsset * currentPrice || '00.00'}`}
                className={clsx(
                  styles.input,
                  { [styles.inputError]: errors.amount },
                  { [styles.inputText]: !!watchAmount }
                )}
                onFocus={() => setIsFocusAmount(true)}
                {...register('amount', {
                  required: true,
                  validate: validateAmountCurrency,
                  onBlur: () => setIsFocusAmount(false),
                })}
              />
            </>
          ) : (
            <>
              <input
                placeholder={`Min ${+minAmountAsset || '00.00'}`}
                className={clsx(
                  styles.input,
                  { [styles.inputError]: errors.amount },
                  { [styles.inputText]: !!watchAmount }
                )}
                onFocus={() => setIsFocusAmount(true)}
                {...register('amount', {
                  required: true,
                  validate: validateAmountCrypto,
                  onBlur: () => setIsFocusAmount(false),
                })}
              />
              <div onClick={changeAmountCurrency} className={styles.currencyBlock}>
                ≈ {currency.symbol}{' '}
                {watchAmount
                  ? getBalanceString(+watchAmount * currentPrice, 2)
                  : `${+(minAmountAsset || 0) * currentPrice}`}
                &nbsp;
                <ChangeIcon fill='var(--P-System-Green)' width={9} height={9} />{' '}
              </div>
            </>
          )}
        </div>

        <div style={{ color: 'var(--Deep-Space)' }} className={clsx(styles.assetNameMax)}>
          {asset.assetId}
        </div>

        <div className={clsx(styles.assetNameMax)} onClick={handleMaxBtn}>
          Max
        </div>
      </div>

      <div className={styles.balanceWrap}>
        {errors.amount && errors.amount.type === 'validate' ? (
          <img src={infoIconError} alt={''} className={styles.errorIcon} />
        ) : null}
        <div className={clsx(styles.balance, { [styles.error]: errors.amount && errors.amount.type === 'validate' })}>
          {errors.amount && errors.amount.type === 'validate' ? 'Insufficient Balance:' : 'Balance:'}{' '}
          {getBalanceString(+asset.availableBalance, 8)} {asset.assetId} /{' '}
          {getBalanceString(+asset.availableBalance * currentPrice, 2)} {currency.type}
        </div>
      </div>
    </>
  )
}
