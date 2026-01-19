import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { getBalanceString } from 'utils'
import { Currencies } from 'wip/stores'
import ChangeIcon from 'assets/icons/ChangeIcon'

import { isBiz } from '../../../config'
import { useCurrentBreakpointPairs } from '../../../hooks/use-current-breakpoint-pairs'
import { $currency } from '../../../model/currency'
import { ExchangeInputs } from './exchange'
import stylesFideum from './styles.module.scss'
import stylesBiz from './styles-biz.module.scss'

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

export function AmountInput({
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
  const styles = isBiz ? stylesBiz : stylesFideum

  const currency = useUnit($currency)

  const { isMobilePairs } = useCurrentBreakpointPairs()

  const {
    register,
    formState: { errors },
    setValue,
  } = methods

  const [isFocusAmount, setIsFocusAmount] = useState(false)

  const symbol = (): string => {
    if (isEurFixed && isCurrency) return 'EUR'
    if (isCurrency) {
      return currency.symbol === Currencies.USD ? 'USD' : 'EUR'
    }
    return asset.symbol
  }

  const handleInputChange = (e: any, name: string): void => {
    const cleanedValue = e.target.value.replace(/[^0-9.,]/g, '')
    const sanitizedValue = cleanedValue.replace(',', '.').replace(/(\..*)\./g, '$1')
    // @ts-ignore
    setValue(name, sanitizedValue)
  }

  return (
    <div>
      <div
        className={clsx(styles.inputBlock, isFocusAmount ? styles.focusAmount : '')}
        style={
          errors[`${direction}AmountCurrency`] ||
          errors[`${direction}AmountCrypto`] ||
          (direction === 'from' && +cryptoAmount > +asset.availableBalance)
            ? { borderColor: 'red' }
            : {}
        }
      >
        <div className={styles.assetName}>{symbol()}</div>
        {isBiz && handleMax ? (
          <div className={clsx(styles.assetName, styles.assetNameMax)} onClick={handleMax}>
            MAX
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            paddingRight: isMobilePairs ? 14 : 0,
          }}
        >
          {isCurrency ? (
            <>
              <div onClick={changeAmountCurrency} className={styles.currencyBlock}>
                ≈&nbsp;{asset.assetId}&nbsp;{cryptoAmount ? getBalanceString(+cryptoAmount, 8) : '0'}
                &nbsp;
                <ChangeIcon fill='var(--Deep-Space)' width={9} height={9} />{' '}
              </div>
              <input
                placeholder='00.00'
                className={styles.input}
                onInput={e => handleInputChange(e, `${direction}AmountCurrency`)}
                onFocus={() => {
                  setIsFocusAmount(true)
                  setFocusName(`${direction}AmountCurrency`)
                }}
                {...register(`${direction}AmountCurrency`, {
                  required: true,
                  onBlur: () => {
                    setIsFocusAmount(false)
                    setFocusName('')
                  },
                })}
              />
            </>
          ) : (
            <>
              <input
                placeholder='00.00'
                className={styles.input}
                onInput={e => handleInputChange(e, `${direction}AmountCrypto`)}
                onFocus={() => {
                  setIsFocusAmount(true)
                  setFocusName(`${direction}AmountCrypto`)
                }}
                {...register(`${direction}AmountCrypto`, {
                  required: true,
                  onBlur: () => {
                    setIsFocusAmount(false)
                    setFocusName('')
                  },
                })}
              />
              <div onClick={changeAmountCurrency} className={styles.currencyBlock}>
                ≈&nbsp;{isEurFixed ? Currencies.EUR : currency.symbol}&nbsp;
                {currencyAmount ? getBalanceString(+currencyAmount, 2) : '0'}
                &nbsp;
                <ChangeIcon fill='var(--Deep-Space)' width={9} height={9} />{' '}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
