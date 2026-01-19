import styles from './styles.module.scss'

const Hint: React.FC = () => {
  return (
    <div className={styles.hintContainer}>
      <div className={styles.hintText}>
        You will be able to unlock and claim your holdings after the fixed time period has expired
      </div>
    </div>
  )
}

export default Hint
