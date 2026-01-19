import comingSoon from 'assets/icons/comingSoon.svg'

import styles from '../styles.module.scss'
import card from './card-fideum.svg'

// TODO delete
const FideumStartPage: React.FC = () => {
  return (
    <div className={styles.transferWrap}>
      <div
        style={{
          padding: 24,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          marginTop: 100,
        }}
      >
        <img src={comingSoon} alt='' />
        <div style={{ height: 30 }} />
        <img className={styles.cardImg} src={card} alt='' />
        <div className={styles.freeHistory} style={{ maxWidth: 453, marginTop: 30 }}>
          Congrats, You are on the Waiting List of Crypto Cards and IBANs!
        </div>
        <div className={styles.freeHistoryDescription}>
          Unleash the power of borderless banking with Fideum. A complete modern fintech platform that provides
          convenient and secure borderless banking services for all.
        </div>
      </div>
    </div>
  )
}

export default FideumStartPage
