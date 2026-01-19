import moment from 'moment'
import clsx from 'clsx'

import { Modal } from 'components'
import { GREEN_TEXT_STYLES } from 'features/transactions-history/constants'
import { StakingUniqueFieldsResponse } from 'features/transactions-history/hooks/type'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { formatStakingTypeForDisplay } from 'utils/transactions-history/format-staking-type-for-display'
import { getAmountSign } from 'utils/transactions-history/get-amount-sign'
import { trimAndFormatDecimal } from 'utils/transactions-history/trimAndFormatDecimal'
import { OperationType } from 'wip/services/transactions-new'

import styles from './styles.module.scss'

type Props = {
  data: StakingUniqueFieldsResponse
}

export function TxnStakingDetail({ data }: Props) {
  const time = data.operationTime || ''

  const formatTime = moment(time).format('MMMM D, YYYY hh:mm A')

  const amount = data.increasedByAmount || data.amount
  const addCommasAmount = addCommasToDisplayValue(amount || '')
  const formatAmount = trimAndFormatDecimal(addCommasAmount, 5)
  const assetId = data.assetId

  return (
    <>
      <div className={styles.main}>
        <>
          <div className={styles.header}>
            <img className={styles.icon} alt='icon' src={data.icon} />
            <div className={styles.headerTitleWrap}>
              <div className={styles.headerTitle}>{data.title}</div>
              <div className={styles.headerSubTitle}>{formatTime}</div>
            </div>
          </div>

          <div className={styles.content}>
            <div className={clsx(styles.amountText, GREEN_TEXT_STYLES.includes(data.title || '') && styles.greenColor)}>
              {getAmountSign(data.title)}
              {formatAmount} {assetId}
            </div>

            <div className={styles.rowWrap}>
              {data.operationType === OperationType.STAKING_REWARD && data.stakingType ? (
                <div className={styles.row}>
                  <div className={styles.rowText}>Staking Type:</div>
                  <div className={styles.rowSubText}>{formatStakingTypeForDisplay(data.stakingType)}</div>
                </div>
              ) : null}
            </div>
          </div>
        </>

        <div className={styles.flexGrow1}></div>

        <button className='btn-new primary' onClick={() => Modal.close()}>
          Looks Good!
        </button>
      </div>
    </>
  )
}
