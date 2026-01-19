import { useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { CardLimitsResponse } from 'wip/services'
import { $cardAccountLimits } from 'model/cefi-banking'

import styles from './styles.module.scss'

type Props = {
  cardUuid: string
  isPreview?: boolean
}
//TODO DELETE
function CardLimits({ cardUuid, isPreview }: Props) {
  const cardAccountLimits = useUnit($cardAccountLimits)

  const prepareViewData = (data: number) => {
    if (!data) return '0.0'
    return parseFloat(data.toString())
  }

  const [newLimits, setNewLimits] = useState<CardLimitsResponse | null>(null)

  // useEffect(() => {
  //   CardService.getCardLimits(cardUuid).then(r => {
  //     setNewLimits(r)
  //   })
  // }, [])

  if (!newLimits) {
    return null
  }

  const cardLimitsFields = [
    {
      title: 'Card Contactless daily',
      purchaseUsed: prepareViewData(newLimits.dailyContactlessPurchase.used),
      purchaseAvailable: prepareViewData(newLimits.dailyContactlessPurchase.total),
      remaining: prepareViewData(newLimits.dailyContactlessPurchase.available),
    },
    {
      title: 'Account Contactless daily',
      limits: cardAccountLimits?.dailyContactlessPurchase || '0.0',
    },
    {
      title: 'Card Contactless monthly',
      purchaseUsed: prepareViewData(newLimits.monthlyContactlessPurchase.used),
      purchaseAvailable: prepareViewData(newLimits.monthlyContactlessPurchase.total),
      remaining: prepareViewData(newLimits.monthlyContactlessPurchase.available),
    },
    {
      title: 'Account Contactless monthly',
      limits: cardAccountLimits?.monthlyContactlessPurchase || '0.0',
    },
    {
      title: 'Card Internet daily',
      purchaseUsed: prepareViewData(newLimits.dailyInternetPurchase.used),
      purchaseAvailable: prepareViewData(newLimits.dailyInternetPurchase.total),
      remaining: prepareViewData(newLimits.dailyInternetPurchase.available),
    },
    {
      title: 'Account Internet daily',
      limits: cardAccountLimits?.dailyInternetPurchase || '0.0',
    },
    {
      title: 'Card Internet monthly',
      purchaseUsed: prepareViewData(newLimits.monthlyInternetPurchase.used),
      purchaseAvailable: prepareViewData(newLimits.monthlyInternetPurchase.total),
      remaining: prepareViewData(newLimits.monthlyInternetPurchase.available),
    },
    {
      title: 'Account Internet monthly',
      limits: cardAccountLimits?.monthlyInternetPurchase || '0.0',
    },
    {
      title: 'Card Cash daily',
      purchaseUsed: prepareViewData(newLimits.dailyWithdrawal.used),
      purchaseAvailable: prepareViewData(newLimits.dailyWithdrawal.total),
      remaining: prepareViewData(newLimits.dailyWithdrawal.available),
    },
    {
      title: 'Card Cash monthly',
      purchaseUsed: prepareViewData(newLimits.monthlyWithdrawal.used),
      purchaseAvailable: prepareViewData(newLimits.monthlyWithdrawal.total),
      remaining: prepareViewData(newLimits.monthlyWithdrawal.available),
    },
    {
      title: 'Card Purchase daily',
      purchaseUsed: prepareViewData(newLimits.dailyPurchase.used),
      purchaseAvailable: prepareViewData(newLimits.dailyPurchase.total),
      remaining: prepareViewData(newLimits.dailyPurchase.available),
    },
    {
      title: 'Card Purchase monthly',
      purchaseUsed: prepareViewData(newLimits.monthlyPurchase.used),
      purchaseAvailable: prepareViewData(newLimits.monthlyPurchase.total),
      remaining: prepareViewData(newLimits.monthlyPurchase.available),
    },
  ]

  return (
    <div className={styles.limitContainer}>
      {cardLimitsFields.map(limitField => {
        const value = limitField.purchaseUsed ? +limitField.purchaseUsed : 0
        const max = limitField.purchaseAvailable ? +limitField.purchaseAvailable : 0
        const progress = (value / max) * 100

        return (
          <div key={limitField.title} className={styles.limitCardRow}>
            <div className={styles.limitCardTitle}>{limitField.title}</div>

            <div className={styles.limitCardAmountWrap}>
              {limitField.purchaseUsed ? (
                <div className={styles.limitCardAmountRow}>
                  <div className={styles.limitCardAmount}>
                    {addCommasToDisplayValue(limitField.purchaseUsed.toString(), 2)} EUR /{' '}
                    {addCommasToDisplayValue(limitField.purchaseAvailable.toString(), 2)} EUR
                  </div>
                  <div className={clsx(styles.limitCardRemaining, limitField.remaining === '0.0' && styles.colorRed)}>
                    Remaining: {addCommasToDisplayValue(limitField.remaining.toString(), 2)} EUR
                  </div>
                </div>
              ) : null}

              {limitField.limits ? (
                <div className={styles.limitCardAmountRow}>
                  <div className={styles.limitCardAmount}>
                    {addCommasToDisplayValue(limitField.limits.toString(), 2)} EUR
                  </div>
                </div>
              ) : null}

              <div className={styles.limitCardProgress}>
                <div style={{ width: `${progress}%` }} className={styles.limitCardProgressActive} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
