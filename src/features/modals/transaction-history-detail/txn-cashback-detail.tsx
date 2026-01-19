import moment from 'moment'
import clsx from 'clsx'

import { Modal } from 'components'
import { CryptoAndFiatHistoryTypeNew } from 'features/transactions-history/hooks/type'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { trimAndFormatDecimal } from 'utils/transactions-history/trimAndFormatDecimal'

import styles from './styles.module.scss'

type Props = {
  data: CryptoAndFiatHistoryTypeNew
}

export function TxnCashbackDetail({ data }: Props) {
  const time = data.transactionDate || ''

  const formatTime = moment(time).format('MMMM D, YYYY hh:mm A')

  const amount = data.cashbackAmount
  const addCommasAmount = addCommasToDisplayValue(amount || '')
  const formatAmount = trimAndFormatDecimal(addCommasAmount, 5)
  const formatSpent = trimAndFormatDecimal(data.transactionAmount || '', 2)
  const formatAccountCashbackAmount = trimAndFormatDecimal(data.accountCashbackAmount || '', 2)

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
            <div className={clsx(styles.amountText, styles.greenColor)}>
              +{formatAmount} {data.cashbackAssetId}
              <div className={styles.rowSubText} style={{ textAlign: 'left', marginTop: '10px' }}>
                +{addCommasToDisplayValue(formatAccountCashbackAmount, 2)} {data.accountCurrencyCode}
              </div>
            </div>

            <div className={styles.rowWrap}>
              <div className={styles.row}>
                <div className={styles.rowText}>Exchange rate:</div>
                <div className={styles.rowSubText}>
                  1 {data.accountCurrencyCode} = {addCommasToDisplayValue(data.exchangeRate || '', 5)}{' '}
                  {data.cashbackAssetId}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.rowText}>Spent:</div>
                <div className={styles.rowSubText}>
                  -{formatSpent} {data.transactionCurrencyCode}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.rowText}>Merchant:</div>
                <div className={styles.rowSubText}>{data.merchantName}</div>
              </div>
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
