import { HeaderTitle } from '../../components'
import { FancyPhysicalCard } from '../modals/fancy-physical-card'
import styles from '../trade-assets/styles.module.scss'

export function PhysicalCardOrder() {
  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle={'New Card Order'} showBackBtn backBtnTitle={'Card'} />
      <div className={styles.contentWrap}>
        <FancyPhysicalCard />
      </div>
    </div>
  )
}
