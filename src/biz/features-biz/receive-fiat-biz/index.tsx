import React, { useEffect, useState } from 'react'

import { CircleCheckIcon } from 'icons/circle-check-icon'

import { Spinner } from '../../../components'
import { CopiedBiz } from '../../../components/copied-biz'
import { CopyBizIcon } from '../../../icons/copy-biz'
import { DepositInfoResponse, FiatService } from '../../../wip/services'
import styles from './styles.module.scss'

export function ReceiveFiatBiz() {
  const [isLoading, setIsLoading] = useState(true)
  const [fiatDepositInfo, setFiatDepositInfo] = useState<DepositInfoResponse | null>(null)
  const [copiedName, setCopiedName] = useState<string | null>(null)

  const beneficiaryInfo = fiatDepositInfo?.beneficiaryInfo

  //TODO: data for Kaizen or Fideum.com?
  const bankFiatData = [
    { name: 'Account Holder Name', value: beneficiaryInfo?.accountHolderName || '' },
    { name: 'IBAN Account', value: beneficiaryInfo?.iban || '' },
    { name: 'Bank Name', value: beneficiaryInfo?.bankName || '' },
    { name: 'BIC / SWIFT Code', value: beneficiaryInfo?.swiftCode || '' },
    { name: 'Bank Address', value: beneficiaryInfo?.bankAddress || '' },
  ]

  useEffect(() => {
    FiatService.getFiatDepositInfo()
      .then(res => {
        setFiatDepositInfo(res)
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleCopy = (data: { name: string; value: string }) => {
    navigator.clipboard.writeText(data.value).then(() => {
      setCopiedName(data.name)
      setTimeout(() => {
        setCopiedName(null)
      }, 2000)
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrap}>
        {isLoading ? (
          <div className={styles.spinnerWrap}>
            <Spinner />
          </div>
        ) : (
          <>
            <div className={styles.title}>Receive Fiat</div>
            <div className={styles.description}>
              The bank account from which you are&nbsp;depositing must&nbsp;be&nbsp;under your full name. The minimum
              deposit amount is&nbsp;€50, and&nbsp;the&nbsp;maximum is&nbsp;€1500
              or&nbsp;it&nbsp;will&nbsp;not&nbsp;be&nbsp;credited. Please note that&nbsp;SWIFT deposits incur a €25 fee.
            </div>
            <div className={styles.infoWrap}>
              {bankFiatData.map(item => {
                return (
                  <div key={item.name} className={styles.rowItem} onClick={() => handleCopy(item)}>
                    <div className={styles.rowItemText}>
                      <div style={{ opacity: 0.3 }}>{item.name}</div>
                      <div className={styles.rowItemTextData}>{item.value}</div>
                    </div>
                    <div className={styles.copyBtn}>
                      {copiedName === item.name ? <CircleCheckIcon /> : <CopyBizIcon />}
                    </div>
                  </div>
                )
              })}
              {!fiatDepositInfo?.referenceCode ? null : (
                <div
                  onClick={() => handleCopy({ name: 'Your Reference Code', value: fiatDepositInfo.referenceCode })}
                  className={styles.rowItem}
                >
                  <div className={styles.rowItemText}>
                    <div style={{ opacity: 0.3 }}>
                      Your Reference Code <br />
                      <span className={styles.rowItemTextSpan}>(Must be included in the description)</span>
                    </div>
                    <div className={styles.rowItemTextData}>{fiatDepositInfo.referenceCode}</div>
                  </div>
                  <div className={styles.copyBtn}>
                    {copiedName === 'Your Reference Code' ? <CircleCheckIcon /> : <CopyBizIcon />}
                  </div>
                </div>
              )}
            </div>

            {copiedName ? (
              <div className={styles.copiedWrap}>
                <CopiedBiz value={copiedName + ' ' + 'Copied'} />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
