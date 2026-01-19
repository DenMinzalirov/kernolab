import { UseFormReturn } from 'react-hook-form'
import clsx from 'clsx'

import i18n from 'components/i18n/localize'
import { regex } from 'constant'

import { OtcNewRequestForm } from './otc-new-request'
import styles from './styles.module.scss'

type Props = {
  methods: any
}

export const OtcStepContacts = ({ methods }: Props) => {
  const { t } = i18n

  const {
    register,
    formState: { errors },
    setValue,
  } = methods

  return (
    <div className={styles.stepOneContainer}>
      <div style={{ height: 36 }}></div>

      <div className={styles.stepDescription}>Please enter your contact details so that we may reach out to you.</div>

      <div style={{ height: 58 }}></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className={styles.inputWrapper}>
          <label className={clsx(styles.inputLabel, { [styles.inputErrorLabel]: errors.phone })}>Phone Number</label>
          <input
            id='phone'
            type='text'
            className={clsx(styles.input, { [styles.inputError]: errors.phone })}
            placeholder='Type here..'
            {...register('phone', {
              required: true,
              pattern: {
                value: regex.phone,
                message: 'Invalid phone',
              },
              validate: (value: any) => {
                const trimmedValue = value.replace(/[^+\d]/g, '')
                if (trimmedValue.length < 8 || trimmedValue.length > 16) {
                  return 'Phone number must be between 8 and 16 characters long.'
                }
              },
              onChange(event: any) {
                let cleanedValue = event.target.value?.replace(/[^0-9()\s_-]+/g, '')
                if (cleanedValue.charAt(0) !== '+') {
                  cleanedValue = '+' + cleanedValue
                }
                setValue('phone', cleanedValue)
              },
            })}
          />
        </div>

        <div className={styles.inputWrapper}>
          <label className={clsx(styles.inputLabel, { [styles.colorRed]: errors.email })}>
            Email address {errors.email && errors.email.type === 'pattern' ? t('inputError.invalid') : ''}
            {errors.email && errors.email.type === 'required' ? t('inputError.required') : ''}
          </label>
          <input
            id='email'
            type='text'
            className={clsx(styles.input, { [styles.inputError]: errors.email })}
            placeholder='Type here..'
            {...register('email', {
              required: true,
              pattern: {
                value: regex.email,
                message: t('signIn.invalidEmail'),
              },
              onChange(event: any) {
                setValue('email', event.target.value?.toLowerCase()?.trim())
              },
            })}
          />
        </div>

        <div className={styles.inputWrapper}>
          <label className={styles.inputLabel}>Full name</label>
          <input
            id='name'
            type='text'
            className={clsx(styles.input, { [styles.inputError]: errors.name })}
            placeholder='Type here..'
            {...register('name', {
              required: true,
            })}
          />
        </div>
      </div>
    </div>
  )
}
