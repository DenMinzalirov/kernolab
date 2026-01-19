import React, { useState } from 'react'
import { useUnit } from 'effector-react'

import { ErrorRedBlock } from 'components'
import { roundingBalance } from 'utils'
import { CardService } from 'wip/services'
import { Currencies } from 'wip/stores'
import { $cardStatus, getCardStatusFx } from 'model/cefi-banking'

import { $assetEurData } from '../../model/cefi-combain-assets-data'
import styles from './styles.module.scss'

type Props = {
  goToTopUp: () => void
}

export function StepDeposit({ goToTopUp }: Props) {
  const cardStatus = useUnit($cardStatus)

  const [loading, setLoading] = useState(false)
  const [requestError, setRequestError] = useState('')

  const fiatAsset = useUnit($assetEurData)

  return (
    <div className={styles.stepContentContainer}>
      <div className={styles.freeHistoryDescription} style={{ textAlign: 'center' }}>
        To continue with the application please complete the €50 deposit to your card balance.
      </div>
      <div style={{ height: 58 }} />
      <div className='input-item-wrap-new'>
        <label className={`input-label`}>Deposit Amount</label>
        <input
          placeholder='00.00'
          className='input-form'
          value={cardStatus?.additionalInfo?.minimalAmount || 50}
          disabled
        />
        {/*<div style={{marginRight: 17}}>{cardStatus?.additionalInfo?.assetId || 'EUR'}</div>*/}
        <div className={styles.currencyType}>
          <div className={styles.btnTitle}>EUR</div>
        </div>
      </div>
      <div className={styles.fiatBalanceAmount}>
        EUR Balance{' '}
        <span
          style={{
            color:
              Number(fiatAsset?.availableBalance || 0) >= (cardStatus?.additionalInfo?.minimalAmount || 50)
                ? 'var(--P-System-Green)'
                : 'var(--P-System-Red)',
          }}
        >
          {Currencies.EUR}
          {roundingBalance(fiatAsset?.availableBalance?.toString() || '0', 2)}
        </span>{' '}
      </div>

      {Number(fiatAsset?.availableBalance || 0) >= 50 ? (
        <div className={styles.freeHistoryDescription} style={{ marginTop: 0, marginBottom: 64 }}>
          Deposit will be deducted from your fiat balance.
        </div>
      ) : (
        <div
          className={styles.freeHistoryDescription}
          style={{ marginTop: 0, marginBottom: 64, color: 'var(--P-System-Red)', fontWeight: 500 }}
        >
          Not enough fiat balance. Top up your balance to be able to buy.
        </div>
      )}

      <div className={styles.btnHeight} />

      <button
        onClick={async e => {
          e.preventDefault()
          setLoading(true)
          try {
            if (Number(fiatAsset?.availableBalance || 0) >= (cardStatus?.additionalInfo?.minimalAmount || 50)) {
              const statusData = await CardService.setOrderCardDeposit({
                amount: (cardStatus?.additionalInfo?.minimalAmount || 50).toString(),
              })
              await getCardStatusFx()
            } else {
              goToTopUp()
            }
          } catch (error: any) {
            setRequestError(error.code || 'Deposit Error')
            console.log('submitOrderStatus(DEPOSIT)-ERROR', error)
          }
          setLoading(false)
        }}
        className='btn-new primary big'
        style={
          Number(fiatAsset?.availableBalance || 0) >= (cardStatus?.additionalInfo?.minimalAmount || 50)
            ? {}
            : { backgroundColor: 'var(--P-System-Red)' }
        }
      >
        {loading ? (
          <span className='spinner-border' />
        ) : (
          <div className={styles.btnTitle}>
            {Number(fiatAsset?.availableBalance || 0) >= (cardStatus?.additionalInfo?.minimalAmount || 50)
              ? 'Deposit & Order Card'
              : 'Top Up Fiat Balance'}
          </div>
        )}
      </button>

      {requestError ? <ErrorRedBlock requestError={requestError} /> : null}
    </div>
  )
}
