import { useEffect, useState } from 'react'

import { Spinner } from 'components'
import { CopyComponent } from 'components/copy-component'
import { DepositInfoResponse, FiatService } from 'wip/services'

import styles from './styles.module.scss'

// Мок-данные для fallback
const mockFiatDepositInfo: DepositInfoResponse = {
  referenceCode: 'REF-123456789',
  beneficiaryInfo: {
    accountHolderName: 'Kernolab Ltd',
    iban: 'LT121000011101001000',
    bankName: 'SEB Bankas',
    bicCode: 'CBVILT2X',
    swiftCode: 'CBVILT2X',
    bankAddress: 'Gedimino pr. 12, LT-01103 Vilnius, Lithuania',
  },
}

export function DepositBankingModal() {
  const [isCopied, setIsCopied] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [fiatDepositInfo, setFiatDepositInfo] = useState<DepositInfoResponse | null>(null)
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
        setFiatDepositInfo(res || mockFiatDepositInfo)
      })
      .catch(() => {
        setFiatDepositInfo(mockFiatDepositInfo)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <div className={styles.content}>
      <div className={styles.contentWrap}>
        {isLoading ? (
          <div className='justify-row-center'>
            <Spinner />
          </div>
        ) : (
          <>
            <div className={styles.transfer}>Top Up via Wire Transfer</div>
            <div className={styles.transferDescription}>
              For wire transfers, copy the details below and include your reference code.
              <br /> Minimum deposit is €50. SWIFT deposits incur a €25 fee.
              <br />
              <br />
              Fiat deposits may take longer to process. Contact support if you experience any issues.
            </div>

            <div className={styles.infoList}>
              {bankFiatData.map(item => {
                return (
                  <div
                    key={item.name}
                    onClick={() => {
                      navigator.clipboard.writeText(item.value || '').then(() => {
                        setIsCopied(item.value || '')
                        setTimeout(() => {
                          setIsCopied('')
                        }, 2000)
                      })
                    }}
                    className={styles.infoListRow}
                  >
                    <div className={styles.infoListRowTitleWrap}>
                      <div className={styles.infoListRowTitle}>{item.name}</div>
                      <div className={styles.infoListRowSubTitle}>{item.value}</div>
                    </div>

                    <CopyComponent isCopied={isCopied === item.value} />
                  </div>
                )
              })}

              {!fiatDepositInfo?.referenceCode ? null : (
                <div
                  onClick={() => {
                    navigator.clipboard.writeText(fiatDepositInfo.referenceCode).then(() => {
                      setIsCopied(fiatDepositInfo.referenceCode)
                      setTimeout(() => {
                        setIsCopied('')
                      }, 2000)
                    })
                  }}
                  className={styles.infoListRow}
                >
                  <div className={styles.infoListRowTitleWrap}>
                    <div className={styles.infoListRowTitle}>
                      Your Reference Code <br />
                      (Must be included in the description)
                    </div>
                    <div className={styles.infoListRowSubTitle}>{fiatDepositInfo.referenceCode}</div>
                  </div>

                  <CopyComponent isCopied={isCopied === fiatDepositInfo.referenceCode} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
