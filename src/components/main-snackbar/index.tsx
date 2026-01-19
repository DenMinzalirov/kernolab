import { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { $snackComponent } from '../../model/snackComponent'
import styles from './styles.module.scss'

export function MainSnackbar() {
  const snackComponent = useUnit($snackComponent)
  const [outClassName, setOutClassName] = useState(false)

  useEffect(() => {
    setOutClassName(false)

    const timeoutId = setTimeout(() => {
      setOutClassName(true)
    }, 5000)

    return () => clearTimeout(timeoutId)
  }, [snackComponent])

  if (!snackComponent) return null

  return (
    <div className={clsx(styles.mainSnackBarWrap, snackComponent && styles.fadeIn, outClassName && styles.fadeOut)}>
      {snackComponent}
    </div>
  )
}
