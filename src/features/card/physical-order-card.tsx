import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import backArrow from '../../assets/icons/back-arrow-green.svg'
import { Modal } from '../../components'
import { pages } from '../../constant'
import { $tierLevel } from '../../model/cefi-stacking'
import { getToken, parseJwt } from '../../utils'
import { FancyPhysicalCard } from '../modals/fancy-physical-card'
import styles from './styles.module.scss'
import cardBody from './SVG/card-body.svg'

export function PhysicalOrderCard() {
  const accessToken = getToken()
  const parsedToken = parseJwt(accessToken || '')
  const scope = parsedToken?.scope || []

  const navigate = useNavigate()

  const tierLevel = useUnit($tierLevel)

  const isCanOrderPhysical = () => {
    if (scope.includes('PAYROLL')) return true
    if (tierLevel >= 2) return true
    return false
  }

  const goToEarn = () => {
    navigate(pages.EARN.path)
  }

  const getPhysicalCard = () => {
    navigate(pages.PHYSICAL_CARD_ORDER.path)
  }

  return (
    <div className={styles.cardBody}>
      <div className={styles.cardBodyImageWrap}>
        <img src={cardBody} alt='card' className={styles.cardBodyImage} />
      </div>

      {isCanOrderPhysical() ? (
        <div style={{ maxWidth: 377 }}>
          <div className={styles.titleOrderCard}>Get Physical Card</div>
          <div style={{ height: 12 }} />
          <p className={styles.descriptionOrderCard}>
            Experience seamless transactions, enhanced security, and worldwide access with our physical debit card.
          </p>
          <div style={{ height: 24 }} />
          <button onClick={getPhysicalCard} className='btn-new big primary' style={{ maxWidth: 440 }}>
            Order Now
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 377 }}>
          <p className={styles.descriptionOrderCard}>
            Your current tier doesn&apos;t support a physical debit card. You can continue using your virtual card
            or&nbsp;upgrade your tier in the Earn section.
          </p>
          <div style={{ height: 24 }} />
          <button onClick={goToEarn} className='btn-new transparent big' style={{ maxWidth: 440 }}>
            <span style={{ color: 'var(--P-System-Green)' }}>Upgrade Tier in Earn</span>
            <img alt='icon' src={backArrow} className={styles.btnIconRight} />
          </button>
        </div>
      )}
    </div>
  )
}
