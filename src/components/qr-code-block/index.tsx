import { useState } from 'react'
import QRCode from 'react-qr-code'
import { useUnit } from 'effector-react'

import { CopyIcon, DangerIcon } from 'icons'
import { $isMobile } from 'model'

import { CombinedObject } from '../../model/cefi-combain-assets-data'
import { addCommasToDisplayValue } from '../../utils/add-commas-to-display-value'
import { NetworkWithAssetInfo } from '../../wip/services'
import { CopyComponent } from '../copy-component'
import styles from './styles.module.scss'

type QRCodeBlock = {
  dataString: string
  tag?: string
  depositNetworkId?: NetworkWithAssetInfo | null
  stringCode?: string
  copiedAction?: () => void // TODO deprecated
  asset?: CombinedObject
  error?: string
}

export function QRCodeBlock({
  dataString,
  depositNetworkId,
  stringCode = '',
  copiedAction,
  asset,
  tag,
  error,
}: QRCodeBlock) {
  const isMobile = useUnit($isMobile)
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = (): void => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000)
  }

  const handleOnClickCopied = async (data: string) => {
    if (!data) return

    try {
      await navigator.clipboard.writeText(data)
      handleCopy()
      if (copiedAction) {
        copiedAction()
      }
    } catch (e) {
      console.error('Error copying text:', e)
    }
  }

  return (
    <div className={styles.qrWrap}>
      <div className={styles.qrContent}>
        <QRCode
          size={256}
          style={{ height: 'auto', maxWidth: '293px', width: '293px' }}
          value={dataString}
          viewBox='0 0 256 256'
          className={error && styles.blur}
        />

        {error ? (
          <div className={styles.errorContainer}>
            <div className={styles.errorBox}>
              <div className={styles.errorBoxTitle}>
                <DangerIcon /> Unexpected Error
              </div>
              <div className={styles.errorBoxText}>
                We&apos;re experiencing technical difficulties. Please try again later or contact support.
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div>
        {depositNetworkId ? <div className={styles.qrLabel}>Deposit Address:</div> : null}
        <div className={styles.qrText}>
          <div className={styles.addressText}>{error ? '–' : stringCode || dataString}</div>
          <div style={{ cursor: 'pointer', marginTop: 3 }} onClick={() => handleOnClickCopied(stringCode)}>
            <CopyComponent isCopied={isCopied} />
          </div>
        </div>

        {tag ? (
          <div className={styles.memoTagWrap}>
            <div className={styles.qrLabel}>Memo Tag:</div>
            <div className={styles.qrText}>
              <div className={styles.addressText}>{tag}</div>
              <div style={{ cursor: 'pointer', marginTop: 3 }} onClick={() => handleOnClickCopied(tag || '')}>
                <CopyComponent isCopied={isCopied} />
              </div>
            </div>
          </div>
        ) : null}
        {/*Note: Minimum deposit is 20 TON. Please ensure accuracy to protect your assets.*/}
        {depositNetworkId?.networkId && (
          <div className={styles.note}>
            Note: Minimum deposit is{' '}
            {addCommasToDisplayValue((+depositNetworkId?.minimumDepositAmount || 0).toString(), 6)} {asset?.assetId}.
            Please ensure accuracy to protect your assets.
          </div>
        )}
      </div>
    </div>
  )
}
