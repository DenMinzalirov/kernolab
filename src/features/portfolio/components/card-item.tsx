import { HTMLAttributes } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { roundingBalance } from 'utils'
import { SoonIcon } from 'icons'
import { $currency } from 'model/currency'

import styles from './styles.module.scss'

export interface CardItem extends HTMLAttributes<HTMLDivElement> {
  title: string
  amount: string
  changeRate: string
  isSoon?: boolean
}

export function CardItem({ title, amount, changeRate, isSoon }: CardItem) {
  const currency = useUnit($currency)

  return (
    <div className={styles.cardWrap}>
      <div className={styles.cardTitle}>{title}</div>

      <div className={styles.cardAmountWrap}>
        <div className={styles.cardAmount}>
          {currency.symbol}
          {roundingBalance(amount, 2)}
        </div>

        {!changeRate ? (
          <div className={styles.emptyCardChangeRateWrap} />
        ) : (
          <div className={clsx(styles.cardChangeRateWrap, +changeRate >= 0 ? {} : styles.cardChangeRateMinus)}>
            {+changeRate >= 0 ? '+' : ''}
            {roundingBalance(changeRate, 2)}%{isSoon && <SoonIcon style={{ marginLeft: 'auto' }} />}
          </div>
        )}
      </div>
    </div>
  )
}
