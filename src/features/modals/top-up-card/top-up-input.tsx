import clsx from 'clsx'

import styles from './styles.module.scss'

type PropsInput = {
  formMethods: any
  maxValue: number
  minValue: number
  assetId: string
  isError?: boolean
}

export function TopUpInput({ formMethods, maxValue, assetId, isError, minValue }: PropsInput) {
  const {
    register,
    formState: { errors },
    setValue,
  } = formMethods

  const handleMaxClick = () => {
    setValue('amount', maxValue.toString())
  }

  return (
    <div className={styles.inputWrap}>
      <input
        id='amount'
        inputMode='decimal'
        className={clsx(styles.input, isError ? styles.inputError : '')}
        placeholder={`Min ${minValue}`}
        {...register('amount', {
          required: true,
          onChange(event: any) {
            const value = event.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
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
        <div className={styles.btnTitle}>{assetId}</div>
        <div onClick={handleMaxClick} className={styles.btnTextMax}>
          Max
        </div>
      </div>
    </div>
  )
}
