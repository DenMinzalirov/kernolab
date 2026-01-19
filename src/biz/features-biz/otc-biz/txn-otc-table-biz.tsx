import { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Spinner } from 'components'
import { $pageOTC, getOtcFx } from 'model/otc'

import { OtcTradeRowBiz } from './components/otc-trade-row-biz'
import styles from './styles.module.scss'

export function TxnOtcTableBiz() {
  const txnPageOTC = useUnit($pageOTC)
  const otcContentResponse = txnPageOTC?.content

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  const getAllOtc = async () => {
    setLoading(true)
    try {
      await getOtcFx()
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllOtc()
  }, [])
  return (
    <div className={styles.tableContainer}>
      <div className={clsx(styles.tableHeader)}>
        <div className={clsx(styles.headerText, 'otcCell1')}>From (asset)</div>
        <div className={clsx(styles.headerText, 'otcCell2')}>To (aaset)</div>
        <div className={clsx(styles.headerText, 'otcCell3', styles.hideLgAndDown)}>Amount</div>
        <div className={clsx(styles.headerText, 'otcCell4', styles.hideLgAndDown)}>Date</div>
        <div className={clsx(styles.headerText, 'otcCell5')}>Status</div>
      </div>

      {loading && (
        <div className={styles.placeholder}>
          <Spinner />
        </div>
      )}

      {!loading && !otcContentResponse?.length && (
        <div className={styles.placeholder}>
          <p className={styles.placeholderText}>You haven&apos;t made any OTC transactions yet.</p>
          <p className={styles.placeholderText}>Submit a request to begin trading.</p>
        </div>
      )}

      {!loading && !!otcContentResponse?.length && (
        <div className={styles.otcTradeRowsWrap}>
          {otcContentResponse.map(transaction => {
            return <OtcTradeRowBiz data={transaction} key={transaction.id} />
          })}
        </div>
      )}
    </div>
  )
}
