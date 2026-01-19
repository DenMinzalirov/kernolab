import { useState } from 'react'

import infoIcon from 'assets/icons/info-icon.svg'

import styles from './styles.module.scss'

export function HintMemo() {
  const [isShowHint, setIsShowHint] = useState(false)
  return (
    <div
      onMouseLeave={() => setIsShowHint(false)}
      onMouseEnter={() => setIsShowHint(true)}
      style={{ position: 'relative', cursor: 'pointer', display: 'flex', marginLeft: 8 }}
    >
      <img src={infoIcon} alt={''} className={styles.hintIcon} />
      {isShowHint ? (
        <div className={styles.hint}>
          <div>
            A&nbsp;memo&nbsp;(or&nbsp;destination tag) is required for certain transactions to&nbsp;ensure your funds
            reach the right account. Some exchanges and&nbsp;custodial wallets use it to identify deposits.
            <br /> ⚠️&nbsp;Make sure to include the correct memo when sending funds to&nbsp;avoid delays or loss.
          </div>
        </div>
      ) : null}
    </div>
  )
}
