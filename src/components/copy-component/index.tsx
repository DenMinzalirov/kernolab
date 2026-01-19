import clsx from 'clsx'

import CopiedSVG from 'icons/copied.svg'
import CopySvgComponent from 'assets/icons/copy-svg-component'

import styles from './styles.module.scss'

type Props = {
  isCopied: boolean
}

export function CopyComponent({ isCopied }: Props) {
  return (
    <div className={styles.copyContainer}>
      <img
        src={CopiedSVG}
        alt='copied'
        className={clsx(styles.iconСopiedWrap, !isCopied ? styles.hidden : styles.visible)}
      />
      <div className={clsx(styles.iconСopyWrap, isCopied ? styles.hidden : styles.visible)}>
        <CopySvgComponent fill='var(--Deep-Space)' />
      </div>
    </div>
  )
}
