import successfullyIcon from 'assets/icons/successfully-xenovo.svg'

import styles from './styles.module.scss'

type Props = {
  title: string
  btnText: string
  action: () => void
  subTitle: string
  variant?: 'main' | 'auth'
}

export function SuccessContentXanova({ title, subTitle, btnText, action, variant = 'main' }: Props) {
  if (variant === 'auth') {
    return (
      <div className={styles.containerAuth}>
        <img src={successfullyIcon} alt='success icon' className={styles.icon} />
        <div className={styles.titleAuth}>{title}</div>
        <div className={styles.subTitleAuth}>{subTitle}</div>
        <button onClick={action} className='btn-xanova big gold'>
          {btnText}
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <img src={successfullyIcon} alt='success icon' className={styles.icon} />
      <div className={styles.title}>{title}</div>
      <div className={styles.subTitle}>{subTitle}</div>
      <a className={styles.buttonLink} onClick={action}>
        {btnText}
      </a>
    </div>
  )
}
