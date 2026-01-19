import { UseFormReturn } from 'react-hook-form'
import clsx from 'clsx'

import { regex } from 'constant'

import styles from './styles.module.scss'
import { OtcNewRequestForm } from './typeAndConstant'

type Props = {
  methods: any
}

export const OtcStepContactsBiz = ({ methods }: Props) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = methods

  return (
    <div className={styles.stepContacts}>
      <div className={styles.stepDescription}>Please enter your contact details so that we may reach out to you.</div>

      <div className={styles.contactsInputsWrapper}>
        <div className='input-item-wrap-biz'>
          <label className={clsx(styles.inputLabel, { [styles.colorRed]: errors.phone })}>Phone Number</label>
          <input
            id='phone'
            type='text'
            className='input-form'
            style={{ padding: '22px 20px', border: errors.phone ? '1px solid red' : '' }}
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

        <div className='input-item-wrap-biz'>
          <label className={clsx(styles.inputLabel, { [styles.colorRed]: errors.email })}>
            Email address {errors.email && errors.email.type === 'pattern' ? 'Invalid' : ''}
            {errors.email && errors.email.type === 'required' ? 'Required' : ''}
          </label>
          <input
            id='email'
            type='text'
            className='input-form'
            style={{ padding: '22px 20px', border: errors.email ? '1px solid red' : '' }}
            placeholder='Type here..'
            {...register('email', {
              required: true,
              pattern: {
                value: regex.email,
                message: 'Invalid email address',
              },
              onChange(event: any) {
                setValue('email', event.target.value?.toLowerCase()?.trim())
              },
            })}
          />
        </div>

        <div className='input-item-wrap-biz'>
          <label className={clsx(styles.inputLabel, { [styles.colorRed]: errors.name })}>
            Full name {errors.name && 'required'}
          </label>
          <input
            id='name'
            type='text'
            className='input-form'
            style={{ padding: '22px 20px', border: errors.name ? '1px solid red' : '' }}
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
