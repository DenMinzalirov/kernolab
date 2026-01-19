import { useEffect, useState } from 'react'

import { Spinner } from 'components'
import { CardFeesResponse, CardService, FeesInfoResponse } from 'wip/services'

import styles from './styles.module.scss'

type MergedFee = {
  type: string
  name: string
  description: string | null
  fixedPart: number
  percentagePart: number
  minAmount: number
}
type Props = {
  cardUuid: string
}
//TODO DELETE
function CardFees({ cardUuid }: Props) {
  const [feesData, setFeesData] = useState<MergedFee[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
    setIsLoading(true)
    try {
      // const [cardFees, feesInfo] = await Promise.all([CardService.getCardFees(cardUuid), CardService.getFeesInfo()])
      // const mergedFees = mergeCardFeesWithInfo(cardFees, feesInfo)
      // setFeesData(mergedFees)
    } catch (error: any) {
      console.error(error)
      // TODO: Add proper error handling
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
    <div className={styles.feesContainer}>
      {/* <div className={styles.titleCardFees}>Your Card Fees</div> */}
      <div className={styles.feesContent}>
        {isLoading ? (
          <div className={styles.titleCardFees}>
            <Spinner />
          </div>
        ) : null}

        {!isLoading &&
          feesData?.length &&
          feesData.map(feeDetail => {
            const feeValue = formatFeeValue(feeDetail)

            return (
              <div className={styles.feesItemContainer} key={feeDetail.type}>
                <div className={styles.feesItemTitleWrap}>
                  <div className={styles.feesItemTitle}>{feeDetail.name}</div>
                  <div className={styles.feesItemDescription}>{feeDetail.description}</div>
                </div>

                <div>
                  <div className={styles.feesItemValue}>{feeValue}</div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
