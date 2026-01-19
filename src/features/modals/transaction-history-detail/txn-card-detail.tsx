import moment from 'moment'
import clsx from 'clsx'

import { Modal } from 'components'
import { TYPE_TXN_HISTORY } from 'features/transactions-history/constants'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { getStatus } from 'utils/transactions-history/get-status'
import { getStatusIndicatorColor } from 'utils/transactions-history/get-status-indicator-color'

import { groupNameMapping } from './card-history-groupMapping'
import styles from './styles.module.scss'

type Props = {
  data: any
}

export function TxnCardDetail({ data }: Props) {
  const time = data.time || data.rewardTime || data.transactionTime || data.purchaseDate || ''

  const formatTime = moment(time).format('MMMM D, YYYY hh:mm A')
  const formatAndCapitalize = (sentence: string) => {
    if (!sentence) return sentence

    sentence = sentence.replace(/_/g, ' ')

    let words = sentence.split(' ')
    words = words.map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    return words.join(' ')
  }

  const getGroupFormatName = (group: string): string | undefined => {
    for (const [key, value] of Object.entries(groupNameMapping)) {
      if (Array.isArray(value)) {
        if (value.includes(group)) {
          return key
        }
      } else {
        if (value === group) {
          return key
        }
      }
    }
    return formatAndCapitalize(group)
  }

  const statusIndicatorColor1 = getStatusIndicatorColor(data.status || '')
  const statusIndicatorColor2 = getStatusIndicatorColor(data.status || '', 'secondary')
  const statusText = getStatus(data.status || '')

  return (
    <>
      <div className={styles.main}>
        {data.transactionType === TYPE_TXN_HISTORY.CARD ? (
          <>
            <div className={styles.header}>
              <img className={styles.icon} alt='icon' src={data.icon} />
              <div className={styles.headerTitleWrap}>
                <div className={styles.headerTitle}>
                  {data.group === 'WITHDRAW' ? 'Cash Withdrawal' : formatAndCapitalize(data?.merchantName)}
                </div>
                <div className={styles.headerSubTitle}>{formatTime}</div>
              </div>
            </div>

            <div className={styles.content}>
              <div className={clsx(styles.amountText, +data?.transactionAmount > 0 ? styles.listGreenColor : '')}>
                {+data?.transactionAmount > 0 ? '+' : ''}
                {addCommasToDisplayValue(data?.transactionAmount, 5)} {data?.transactionCurrencyCode}
              </div>

              <div className={styles.rowWrap}>
                {data.maskedCardNumber ? (
                  <div className={styles.row}>
                    <div className={styles.rowText}>Card:</div>
                    <div className={styles.rowSubText}>{data.maskedCardNumber}</div>
                  </div>
                ) : null}

                {data.group === 'WITHDRAW' ? (
                  <div className={styles.row}>
                    <div className={styles.rowText}>ATM:</div>
                    <div className={styles.rowSubText}>
                      {data.merchantName}, {data.merchantId}, {data.merchantCity}, {data.merchantCountryCode}
                    </div>
                  </div>
                ) : null}

                {data.group !== 'WITHDRAW' && !data.group && data.description ? (
                  <div className={styles.row}>
                    <div className={styles.rowText}>Group:</div>
                    <div className={styles.rowSubText}>{getGroupFormatName(data.description)}</div>
                  </div>
                ) : null}

                {data.group !== 'WITHDRAW' && data.group ? (
                  <div className={styles.row}>
                    <div className={styles.rowText}>Group:</div>
                    <div className={styles.rowSubText}>{getGroupFormatName(data.group)}</div>
                  </div>
                ) : null}

                {data.status ? (
                  <div className={styles.row}>
                    <div className={styles.statusBlockWrap}>
                      <div className={styles.rowText}>Status:</div>

                      <div className={styles.statusBlock}>
                        <div className={styles.statusIndicatorWrap}>
                          <div className={clsx(styles.statusIndicator, styles[statusIndicatorColor1])}></div>
                          <div className={clsx(styles.statusIndicator, styles[statusIndicatorColor2])}></div>
                        </div>
                        <div className={styles.statusBlockText}>{statusText}</div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {data.exchangeRate ? (
                  <div className={styles.row}>
                    <div className={styles.rowText}>VISA exchange rate:</div>
                    <div className={styles.rowSubText}>
                      1 EUR = {addCommasToDisplayValue(data.exchangeRate, 5)} {data.transactionCurrencyCode}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}

        <div className={styles.flexGrow1}></div>

        <button className={clsx('btn-new primary')} onClick={() => Modal.close()}>
          Looks Good!
        </button>
      </div>
    </>
  )
}
