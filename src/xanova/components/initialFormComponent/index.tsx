import clsx from 'clsx'

import styles from './styles.module.scss'

type Props = {
  title: string
  description: string
  btnText: string
  btnAction: () => void
}

export function InitialFormComponent({ title, description, btnText, btnAction }: Props) {
  return (
    <div className={styles.content}>
      <div className={styles.flexVerticalCenterGap12}>
        <h1 className={clsx(styles.title, 'text-center')}>{title}</h1>
        <p className={clsx(styles.subTitle, 'text-center')}>{description}</p>
      </div>
      <button className='btn-xanova big gold' onClick={btnAction}>
        {btnText}
      </button>
    </div>
  )
}
