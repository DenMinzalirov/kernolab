import { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'

import { Spinner } from 'components'
import { CardFeesResponse, CardService, FeesInfoResponse } from 'wip/services'
import { $selectedCardUuid } from 'model/cefi-banking'

import styles from './styles.module.scss'
import { TabSettingsTitle } from './tab-settings-title'

type MergedFee = {
  type: string
  name: string
  description: string | null
  fixedPart: number
  percentagePart: number
  minAmount: number
}

export function CardFees() {
  const [feesData, setFeesData] = useState<MergedFee[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const selectedCardUuid = useUnit($selectedCardUuid)

  const mergeCardFeesWithInfo = (cardFees: CardFeesResponse[], feesInfo: FeesInfoResponse[]): MergedFee[] => {
    const feesInfoMap = new Map(feesInfo.map(info => [info.feeType.toLowerCase(), info]))

    return cardFees.map(cardFee => {
      const feeInfo = feesInfoMap.get(cardFee.type.toLowerCase())

      return {
        type: cardFee.type,
        name: feeInfo?.name || 'Unknown Fee',
        description: feeInfo?.description || null,
        fixedPart: cardFee.fixedPart,
        percentagePart: cardFee.percentagePart,
        minAmount: cardFee.minAmount,
      }
    })
  }

  const fetchFeesData = async () => {
    if (!selectedCardUuid) return

    setIsLoading(true)
    try {
      const [cardFees, feesInfo] = await Promise.all([
        CardService.getCardFees(selectedCardUuid),
        CardService.getFeesInfo(),
      ])
      const mergedFees = mergeCardFeesWithInfo(cardFees, feesInfo)
      setFeesData(mergedFees)
    } catch (error: any) {
      console.error(error)
      // MOCK: Для внутреннего тестирования и разработки
      const mockCardFees: CardFeesResponse[] = [
        { type: 'AUTHORIZATION_FIXED_FEE', fixedPart: 0.5, percentagePart: 0, minAmount: 0 },
        { type: 'AUTHORIZATION_ATM_WITHDRAWAL_FIXED_FEE', fixedPart: 2.5, percentagePart: 0, minAmount: 0 },
        { type: 'AUTHORIZATION_ATM_WITHDRAWAL_PERCENTAGE_FEE', fixedPart: 0, percentagePart: 1.5, minAmount: 0 },
        { type: 'PAYMENT_PERCENTAGE_FEE', fixedPart: 0, percentagePart: 0.3, minAmount: 0 },
        { type: 'PAYMENT_EEA_FIXED_FEE', fixedPart: 0, percentagePart: 0, minAmount: 0 },
        { type: 'AUTHORIZATION_DECLINED_FIXED_FEE', fixedPart: 0, percentagePart: 0, minAmount: 0 },
        { type: 'CARD_USAGE_FIXED_FEE', fixedPart: 1.0, percentagePart: 0, minAmount: 0 },
        { type: 'AUTHORIZATION_FOREIGN_EXCHANGE_PERCENTAGE_FEE', fixedPart: 0, percentagePart: 2.0, minAmount: 0 },
      ]

      const mockFeesInfo: FeesInfoResponse[] = [
        {
          feeType: 'AUTHORIZATION_FIXED_FEE',
          name: 'Transaction Fee',
          description: 'Fixed fee charged per transaction',
        },
        {
          feeType: 'AUTHORIZATION_ATM_WITHDRAWAL_FIXED_FEE',
          name: 'ATM Withdrawal Fixed Fee',
          description: 'Fixed fee for ATM withdrawals',
        },
        {
          feeType: 'AUTHORIZATION_ATM_WITHDRAWAL_PERCENTAGE_FEE',
          name: 'ATM Withdrawal Percentage Fee',
          description: 'Percentage fee based on withdrawal amount',
        },
        {
          feeType: 'PAYMENT_PERCENTAGE_FEE',
          name: 'Payment Processing Fee',
          description: 'Percentage fee for payment processing',
        },
        {
          feeType: 'PAYMENT_EEA_FIXED_FEE',
          name: 'EEA Payment Fee',
          description: 'Fee for payments within EEA',
        },
        {
          feeType: 'AUTHORIZATION_DECLINED_FIXED_FEE',
          name: 'Declined Transaction Fee',
          description: 'Fee for declined transactions',
        },
        {
          feeType: 'CARD_USAGE_FIXED_FEE',
          name: 'Card Usage Fee',
          description: 'Monthly card usage fee',
        },
        {
          feeType: 'AUTHORIZATION_FOREIGN_EXCHANGE_PERCENTAGE_FEE',
          name: 'Foreign Exchange Fee',
          description: 'Percentage fee for foreign currency transactions',
        },
      ]

      const mergedFees = mergeCardFeesWithInfo(mockCardFees, mockFeesInfo)
      setFeesData(mergedFees)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFeesData()
  }, [])

  const formatFeeValue = (feeDetail: MergedFee): string => {
    if (feeDetail?.fixedPart) {
      return `€ ${feeDetail.fixedPart}`
    }
    if (feeDetail?.percentagePart) {
      return `${feeDetail.percentagePart}%`
    }

    return '0'
  }

  return (
    <div className={styles.tabSettingsWrap}>
      <TabSettingsTitle
        title={'Card Fees'}
        description={
          'Stay informed about the fees associated with your card usage. Review charges for top-ups, transactions, ATM withdrawals, foreign exchange, and declined payments to manage your expenses effectively.'
        }
      />

      <div className={styles.feesContainer}>
        {isLoading ? (
          <div className={styles.loadingWrap}>
            <Spinner />
          </div>
        ) : null}

        {!isLoading &&
          !!feesData?.length &&
          feesData.map(feeDetail => {
            const feeValue = formatFeeValue(feeDetail)

            return (
              <div className={styles.feesItemContainer} key={feeDetail.type + feeDetail.name}>
                <div className={styles.feesItemTitleWrap}>
                  <div className={styles.feesItemTitle}>{feeDetail.name}</div>
                  <div className={styles.feesItemDescription}>{feeDetail.description}</div>
                </div>

                <div className={styles.feesItemValue}>{feeValue}</div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
