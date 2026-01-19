import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import moment from 'moment'
import clsx from 'clsx'

import { pages } from 'constant'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { getAmountSign } from 'utils/transactions-history/get-amount-sign'
import { $stepUpBlockExpiration } from 'model/step-up-block-expiration'
import { $travelRuleData, TravelRuleTransaction } from 'model/travel-rule-transactions'
import dangerOrange from 'assets/icons/danger-orange.svg'

import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

export function TravelRuleRequests() {
  const navigate = useNavigate()
  const travelRuleData = useUnit($travelRuleData)
  const securityTimerData = useUnit($stepUpBlockExpiration)
  const { isMobilePairs } = useCurrentBreakpointPairs()

  const handelBtnRowClick = (rowValue: TravelRuleTransaction) => {
    navigate(pages.TRAVEL_RULE.path, { state: rowValue })
  }

  const renderFormatAmount = (item: TravelRuleTransaction | undefined) => {
    if (!item) return <div className={styles.listTextAmount}>no data</div>

    return (
      <div className={clsx(styles.listTextAmount)}>
        {getAmountSign(item.title)}
        {addCommasToDisplayValue(item.amount || '', 8)} {item.assetId}
      </div>
    )
  }

  const renderItem = ({ item }: { item: TravelRuleTransaction }) => {
    return (
      <div className={styles.listRow}>
        <div className={styles.listRowTitleWrap}>
          <div className={styles.listRowTitle}>
            {item.title} {renderFormatAmount(item)}
          </div>
          <div className={styles.listTextDate}>
            {item.createdAt ? moment(item.createdAt).format('MMMM DD, YYYY') : 'no date'}
          </div>
        </div>
        <div className={styles.flexGrow1} />

        <div className={styles.buttonWrap}>
          <button
            onClick={() => handelBtnRowClick(item)}
            className={styles.submitButton}
            disabled={!!securityTimerData?.expiresAt}
          >
            Submit
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {securityTimerData?.expiresAt ? (
        <div className={styles.attentionContainer}>
          <img alt='Icon' src={dangerOrange} />
          <div className={styles.attentionText}>
            Requests are temporarily disabled due to the security timer. Please try again later.
          </div>
        </div>
      ) : null}

      {!isMobilePairs ? (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div className={clsx(styles.headerText, styles.cell1)}>Date</div>
            <div className={clsx(styles.headerText, styles.cell2)}>Type</div>
            <div className={clsx(styles.headerText, styles.cell3)}>Amount</div>
            <div className={clsx(styles.headerText, styles.cell4)}>Asset</div>
            <div className={clsx(styles.headerText, styles.cell5)}>Action</div>
          </div>

          <div className={styles.tableRowsWrap}>
            {travelRuleData.map(item => {
              const date = moment(item.createdAt).format('YYYY-MM-DD')

              return (
                <div key={item.id} className={styles.tableRow}>
                  <div className={clsx(styles.dateText, styles.cell1)}>{date}</div>
                  <div className={clsx(styles.text, styles.cell2)}>{item.title}</div>
                  <div className={clsx(styles.text, styles.cell3)}>
                    {getAmountSign(item.title)}
                    {addCommasToDisplayValue(item.amount || '', 8)} {item.assetId}
                  </div>
                  <div className={clsx(styles.text, styles.cell4)}>{item.assetId}</div>
                  <div className={styles.cell5}>
                    <button
                      onClick={() => handelBtnRowClick(item)}
                      className={styles.submitButton}
                      disabled={!!securityTimerData?.expiresAt}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {isMobilePairs ? (
        <div className={styles.listContainer}>
          {travelRuleData.map(item => (
            <div key={item.id}>{renderItem({ item })}</div>
          ))}
        </div>
      ) : null}
    </>
  )
}
