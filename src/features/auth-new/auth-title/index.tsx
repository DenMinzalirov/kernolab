import clsx from 'clsx'

import I18n from 'components/i18n'

import styles from './styles.module.scss'

type Props = {
  title: string
  description: string
}

const AuthTitle: React.FC<Props> = ({ title, description }) => {
  return (
    <div className={styles.titleWrap}>
      <div className={clsx(styles.title, 'text-center')}>
        <I18n tKey={title} />
      </div>
      <div className={clsx(styles.description, 'text-center')}>
        <I18n tKey={description} />
      </div>
    </div>
  )
}

export default AuthTitle
