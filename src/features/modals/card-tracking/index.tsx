import { useState } from 'react'

import { Modal } from 'components'
import { CopyComponent } from 'components/copy-component'
import { BasicCardInfo } from 'wip/services'
import infoIcon from 'assets/icons/info-icon-v2.svg'

import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

type Props = {
  cardData: BasicCardInfo | undefined
}
export function CardTracking({ cardData }: Props) {
  const [isCopied, setIsCopied] = useState(false)
  const { isMobilePairs } = useCurrentBreakpointPairs()

  const handleCopied = (data: string): void => {
    navigator.clipboard.writeText(data).then(() => {
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    })
  }

  return (
    <div className={styles.cardViewWrap}>
      <div className={styles.contentWrap}>
        <div className={styles.iconWrap}>
          <img src={infoIcon} alt='' className={styles.icon} />
        </div>

        <div className={styles.title}>
          <div>Your Card Tracking</div>
        </div>

        <div className={styles.viewDetailsItemWrap}>
          <div className={styles.row}>
            <div className={styles.viewDetailsTitle}>Delivery Address</div>
            <div className={styles.viewDetailsDescription}>
              {cardData?.deliveryAddress?.address1}
              {cardData?.deliveryAddress?.address2 ? `${', '}${cardData?.deliveryAddress?.address2}, ` : ', '}
              {cardData?.deliveryAddress?.city}, {cardData?.deliveryAddress?.countryCode},{' '}
              {cardData?.deliveryAddress?.postalCode}
            </div>
          </div>
        </div>

        <div className={styles.viewDetailsItemWrap}>
          <div className={styles.row}>
            <div className={styles.viewDetailsTitle}>Delivery Method</div>
            <div className={styles.viewDetailsDescription}>
              {cardData?.deliveryAddress?.dispatchMethod.replaceAll('_', ' ')}
            </div>
          </div>
        </div>

        <div className={styles.viewDetailsItemWrap}>
          <div className={styles.row}>
            <div className={styles.viewDetailsTitle}>Status</div>
            <div className={styles.viewDetailsDescription}>{cardData?.status?.replaceAll('_', ' ') || '****'}</div>
          </div>
        </div>

        <div className={styles.viewDetailsItemWrap}>
          <div className={styles.row}>
            <div className={styles.viewDetailsTitle}>Tracking Number</div>
            <div className={styles.viewDetailsDescription}>
              {['DPD_EXPRESS', 'DHL_EXPRESS'].includes(cardData?.deliveryAddress?.dispatchMethod || '')
                ? cardData?.deliveryAddress?.trackingNumber
                : 'Not available yet'}
            </div>
          </div>
          {['DPD_EXPRESS', 'DHL_EXPRESS'].includes(cardData?.deliveryAddress?.dispatchMethod || '') ? (
            <div
              onClick={() => handleCopied(cardData?.deliveryAddress?.trackingNumber || '')}
              style={{ position: 'relative', cursor: 'pointer', marginLeft: 10 }}
            >
              <CopyComponent isCopied={isCopied} />
            </div>
          ) : null}
        </div>

        <button
          style={{ marginTop: 'auto' }}
          className={`btn-new primary ${isMobilePairs ? 'big' : ''}`}
          onClick={() => Modal.close()}
        >
          Looks Good!
        </button>
      </div>
    </div>
  )
}
