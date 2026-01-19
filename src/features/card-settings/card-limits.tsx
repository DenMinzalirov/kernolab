import { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { CardLimitsResponse, CardService } from 'wip/services'
import { $cardAccountLimits, $selectedCardUuid } from 'model/cefi-banking'

import styles from './styles.module.scss'
import { TabSettingsTitle } from './tab-settings-title'

type Props = {
  isPreview?: boolean
}

export function CardLimits({ isPreview }: Props) {
  const cardAccountLimits = useUnit($cardAccountLimits)
  const selectedCardUuid = useUnit($selectedCardUuid)

  const prepareViewData = (data: number) => {
    if (!data) return '0.0'
    return parseFloat(data.toString())
  }

  const [newLimits, setNewLimits] = useState<CardLimitsResponse | null>(null)

  useEffect(() => {
    if (!selectedCardUuid) return

    CardService.getCardLimits(selectedCardUuid)
      .then(r => {
        setNewLimits(r)
      })
      .catch(error => {
        console.error('Error fetching card limits, using mock data', error)
        // MOCK: Для внутреннего тестирования и разработки
        const mockCardLimits: CardLimitsResponse = {
          dailyPurchase: { total: 8000, used: 1700, available: 6300 },
          dailyWithdrawal: { total: 2000, used: 500, available: 1500 },
          dailyInternetPurchase: { total: 5000, used: 1000, available: 4000 },
          dailyContactlessPurchase: { total: 1000, used: 200, available: 800 },
          dailyOverallPurchase: { total: 7000, used: 1200, available: 5800 },
          weeklyPurchase: { total: 30000, used: 10000, available: 20000 },
          weeklyWithdrawal: { total: 5000, used: 1000, available: 4000 },
          weeklyInternetPurchase: { total: 15000, used: 5000, available: 10000 },
          weeklyContactlessPurchase: { total: 7000, used: 1700, available: 5300 },
          weeklyOverallPurchase: { total: 25000, used: 7000, available: 18000 },
          monthlyPurchase: { total: 120000, used: 30000, available: 90000 },
          monthlyWithdrawal: { total: 10000, used: 2000, available: 8000 },
          monthlyInternetPurchase: { total: 60000, used: 15000, available: 45000 },
          monthlyContactlessPurchase: { total: 30000, used: 5000, available: 25000 },
          monthlyOverallPurchase: { total: 100000, used: 25000, available: 75000 },
          transactionPurchase: 0,
          transactionWithdrawal: 0,
          transactionInternetPurchase: 0,
          transactionContactlessPurchase: 0,
        }
        setNewLimits(mockCardLimits)
      })
  }, [selectedCardUuid])

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
    <div className={styles.tabSettingsWrap}>
      {!isPreview ? (
        <TabSettingsTitle
          title={'Card Limits'}
          description={
            "Keep track of your card's spending limits. View your daily and monthly allowances for contactless payments, ATM withdrawals, and online transactions to stay informed about your usage."
          }
        />
      ) : null}
      <div className={clsx(styles.limitContainer, isPreview && styles.limitContainerPreview)}>
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
                  <div
                    style={{ width: `${isNaN(progress) ? 0 : progress}%` }}
                    className={styles.limitCardProgressActive}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
