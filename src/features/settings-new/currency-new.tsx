import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { initApp } from 'wip/stores'

import { useCurrentBreakpointPairs } from '../../hooks/use-current-breakpoint-pairs'
import { $currency, currencyChangedEv } from '../../model/currency'
import { SettingItemCardWrap } from './setting-item-card-wrap'
import styles from './styles.module.scss'

export function Currency() {
  const currency = useUnit($currency)

  const { isMobilePairs } = useCurrentBreakpointPairs()

  const breakpointText = `You can easily switch your account${
    isMobilePairs ? ' ' : '\n'
  }currency. Select your preferred one.`

  return (
    <SettingItemCardWrap title={'Currency'} description={breakpointText}>
      <div className={styles.currencySwitchBlock}>
        <div
          onClick={async () => {
            currencyChangedEv({
              symbol: '€',
              type: 'EUR',
            })
            await initApp()
          }}
          className={clsx(styles.currencyBtn, currency.type === 'EUR' ? styles.currencyBtnActive : '')}
        >
          EUR
        </div>
        <div
          onClick={async () => {
            currencyChangedEv({
              symbol: '$',
              type: 'USD',
            })
            await initApp()
          }}
          className={clsx(styles.currencyBtn, currency.type === 'USD' ? styles.currencyBtnActive : '')}
        >
          USD
        </div>
      </div>
    </SettingItemCardWrap>
  )
}
