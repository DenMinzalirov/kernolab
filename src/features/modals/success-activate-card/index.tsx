import { Modal } from '../../../components'
import styles from './styles.module.scss'

export function SuccessActivateCard() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.title}>Success!</div>

        <div className={styles.description}>
          Your card has been activated and is now ready for use. Enjoy your secure transactions!
        </div>

        <button style={{ marginTop: 'auto' }} className='btn-new primary' onClick={() => Modal.close()}>
          Close
        </button>
      </div>
    </div>
  )
}
