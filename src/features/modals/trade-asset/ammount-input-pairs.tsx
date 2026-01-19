import React from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { getBalanceString } from 'utils'
import { Currencies } from 'wip/stores'
import { isBiz } from 'config'
import ChangeIcon from 'assets/icons/ChangeIcon'

import { useCurrentBreakpointPairs } from '../../../hooks/use-current-breakpoint-pairs'
import { $currency } from '../../../model/currency'
import styles from './styles-pairs-input.module.scss'

type AmountInput = {
  asset: any
  changeAmountCurrency: () => void
  isCurrency: boolean
  currencyAmount: string
  cryptoAmount: string
  direction: 'from' | 'to'
  setFocusName: React.Dispatch<string>
  methods: any
  isEurFixed?: boolean
  handleMax?: () => void
}

export function AmountInputPairs({
  asset,
  changeAmountCurrency,
  isCurrency,
  currencyAmount,
  cryptoAmount,
  direction,
  setFocusName,
  methods,
  isEurFixed,
  handleMax,
}: AmountInput) {
  const currency = useUnit($currency)

  const { isMobilePairs } = useCurrentBreakpointPairs()

  const {
    register,
    formState: { errors },
    setValue,
  } = methods

  const handleInputChange = (e: any, name: string): void => {
    const cleanedValue = e.target.value.replace(/[^0-9.,]/g, '')
    const sanitizedValue = cleanedValue.replace(',', '.').replace(/(\..*)\./g, '$1')
    // @ts-ignore
    setValue(name, sanitizedValue)
  }

  return (
    <div
      className={clsx(styles.inputBlock)}
      style={
        isBiz &&
        (errors[`${direction}AmountCurrency`] ||
          errors[`${direction}AmountCrypto`] ||
          (direction === 'from' && +cryptoAmount > +asset.availableBalance))
          ? { borderColor: 'red' }
          : {}
      }
    >
      <div
        style={{
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        {isCurrency ? (
          <>
            <div onClick={changeAmountCurrency} className={styles.currencyBlock}>
              <p className={styles.currencyText}>
                ≈&nbsp;{asset.assetId}&nbsp;{currencyAmount ? getBalanceString(+cryptoAmount, 8) : '0'}
                &nbsp;
              </p>
              <div style={{ flexShrink: 1 }}>
                <ChangeIcon fill='var(--P-System-Green)' width={9} height={9} />
              </div>
            </div>

            <input
              placeholder='00.00'
              className={clsx(styles.input, cryptoAmount ? '' : styles.inputPlaceholder)}
              onInput={e => handleInputChange(e, `${direction}AmountCurrency`)}
              onFocus={() => {
                setFocusName(`${direction}AmountCurrency`)
              }}
              {...register(`${direction}AmountCurrency`, {
                required: true,
                onBlur: () => {
                  setFocusName('')
                },
              })}
            />
          </>
        ) : (
          <>
            <input
              placeholder='00.00'
              className={clsx(styles.input, cryptoAmount ? '' : styles.inputPlaceholder)}
              onInput={e => handleInputChange(e, `${direction}AmountCrypto`)}
              onFocus={() => {
                setFocusName(`${direction}AmountCrypto`)
              }}
              {...register(`${direction}AmountCrypto`, {
                required: true,
                onBlur: () => {
                  setFocusName('')
                },
              })}
            />
            <div onClick={changeAmountCurrency} className={styles.currencyBlock}>
              <p className={styles.currencyText}>
                ≈&nbsp;{isEurFixed ? Currencies.EUR : currency.symbol}
                {currencyAmount ? getBalanceString(+currencyAmount, 2) : '0'}
                &nbsp;
              </p>
              <div style={{ flexShrink: 1 }}>
                <ChangeIcon fill='var(--P-System-Green)' width={9} height={9} />
              </div>
            </div>
          </>
        )}
      </div>

      {isMobilePairs ? (
        <div style={{ color: 'var(--Deep-Space)' }} className={clsx(styles.assetNameMax)}>
          {asset.assetId}
        </div>
      ) : null}

      {handleMax ? (
        <div className={clsx(styles.assetNameMax)} onClick={handleMax}>
          Max
        </div>
      ) : null}
    </div>
  )
}
