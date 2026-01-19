import styles from './styles.module.scss'

type Props = {
  text: string | undefined
}

export function TruncatedAddress({ text }: Props) {
  if (!text) return null

  const start = text.slice(0, -5)
  const end = text.slice(-5)

  return (
    <div className={styles.truncatedAddress}>
      <span className={styles.truncatedAddressStart}>{start}</span>
      <span className={styles.truncatedAddressEnd}>{end}</span>
    </div>
  )
}
