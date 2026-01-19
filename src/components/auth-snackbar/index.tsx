import styles from './styles.module.scss'

export interface AuthSnackbar {
  title: string
  description: string
}
//TODO deprecate DELETE
export function AuthSnackbar({ title, description }: AuthSnackbar) {
  return (
    <>
      <div className={styles.firstBlock} />
      <div className={styles.secondBlock}>
        <div className={styles.snackWrap}>
          <p className={styles.title}>{title}</p>
          <p className={styles.description}>{description}</p>
        </div>
      </div>
    </>
  )
}
