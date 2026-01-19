import React from 'react'
import clsx from 'clsx'

import { useCurrentBreakpointPairs } from '../../hooks/use-current-breakpoint-pairs'
import { TriangleIcon } from '../../icons'
import styles from './styles.module.scss'

type Props = {
  isLoading: boolean
  backButtonFn: (e: any) => void
}

export function StepBackBtn({ isLoading, backButtonFn }: Props) {
  const { isMobilePairs } = useCurrentBreakpointPairs()

  return (
    <button onClick={backButtonFn} className={clsx('btn-new grey big', styles.stepBackBtn)}>
      {isLoading ? (
        <span className='spinner-border' />
      ) : (
        <>
          <div style={{ height: 16, marginRight: isMobilePairs ? 0 : 6, width: 16 }}>
            <TriangleIcon fill={'var(--Deep-Space)'} />
          </div>
          {isMobilePairs ? null : <div>Step Back</div>}
        </>
      )}
    </button>
  )
}
