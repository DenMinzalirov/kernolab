import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { TBDHideId } from '../../config'
import { $assetsListData } from '../../model/cefi-combain-assets-data'
import { LaunchpadProject } from '../../wip/services/launchpads'
import styles from './styles.module.scss'

type PropsLaunchpadInput = {
  currentLaunchpad: LaunchpadProject
  formMethods: any
  maxValue: number
  precision: number
  isError: boolean
}

export function LaunchpadInput({ currentLaunchpad, formMethods, maxValue, precision, isError }: PropsLaunchpadInput) {
  const {
    register,
    formState: { errors },
    setValue,
  } = formMethods

  const assets = useUnit($assetsListData)

  const handleMaxClick = () => {
    if (TBDHideId.includes(currentLaunchpad.projectId)) {
      const fiAsset = assets.find(asset => asset.assetId === 'FI')
      setValue('amount', (fiAsset?.availableBalance || '').toString())
    } else {
      setValue('amount', maxValue.toString())
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
        }}
      >
        <input
          id='amount'
          inputMode='decimal'
          className={clsx(styles.input, (errors.amount || isError) && styles.inputError)}
          placeholder={precision > 0 ? '0.00' : '0'}
          {...register('amount', {
            required: true,
            onChange(event: any) {
              let value = event.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')

              if (precision > 0) {
                const parts = value.split('.')
                if (parts.length === 2) {
                  parts[1] = parts[1].slice(0, precision)
                  value = parts.join('.')
                }
              } else {
                value = value.split('.')[0]
              }

              setValue('amount', value.trim())
            },
          })}
          onKeyDown={e => {
            if (
              !/[0-9.,]/.test(e.key) &&
              e.key !== 'Backspace' &&
              e.key !== 'ArrowLeft' &&
              e.key !== 'ArrowRight' &&
              e.key !== 'Delete' &&
              e.key !== 'Tab'
            ) {
              e.preventDefault()
            }
          }}
        />
        <div className={styles.absoluteContent}>
          <div className={styles.btnTitle}>${currentLaunchpad?.supplyAssetId}</div>
          <div onClick={handleMaxClick} className={styles.btnTextMax}>
            Max
          </div>
        </div>
      </div>
    </div>
  )
}
