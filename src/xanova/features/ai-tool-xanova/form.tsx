import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import clsx from 'clsx'

import { fetchXanovaFormsFx, XanovaFormName } from '../../../model'
import { XanovaServices } from '../../../wip/services'
import styles from './styles.module.scss'

type Inputs = {
  language: string
  contactMethods: string[]
  other: string
}

const defaultValues: Inputs = {
  language: '',
  contactMethods: [],
  other: '',
}

//TODO уточнить языки
export const languagesAiForm = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Russian' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'it', label: 'Italian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
]

const contactMethodOptions = [
  { value: 'insurance', label: 'Insurance' },
  { value: 'investments', label: 'Investments' },
  { value: 'fiscal', label: 'Fiscal' },
  { value: 'other', label: 'Other' },
]

export function AiToolXanovaForm() {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    handleSubmit,
    clearErrors,
  } = useForm<Inputs>({ defaultValues, mode: 'onChange' })

  const [isLoading, setIsLoading] = useState(false)

  const selectedLanguage = watch('language')
  const selectedContactMethods = watch('contactMethods') || []
  const isOtherSelected = selectedContactMethods.includes('other')

  useEffect(() => {
    if (!isOtherSelected) {
      setValue('other', '', { shouldDirty: false, shouldValidate: false })
      clearErrors('other')
    }
  }, [isOtherSelected, setValue, clearErrors])

  const contactMethodsRegister = register('contactMethods', {
    validate: value => (Array.isArray(value) && value.length > 0 ? true : 'Required'),
  })
  const otherRegister = register('other', { required: true, disabled: !isOtherSelected })

  const onSubmit = async (data: Inputs) => {
    const formData = {
      ...data,
      createdAt: new Date().toISOString(),
    }

    try {
      setIsLoading(true)

      await XanovaServices.submitForm(XanovaFormName.AI_TOOL, formData)

      await fetchXanovaFormsFx()
    } catch (error) {
      console.log('ERROR-insurance', error)
    }
    setIsLoading(false)
  }

  return (
    <div className={styles.containerForm}>
      <div className={styles.formWrap}>
        <h1 className={styles.title}>Request Form</h1>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={clsx('select-wrap-xanova', errors.language && 'error')}>
            <label htmlFor='language' className={errors.language ? 'text-error' : ''}>
              Preferred Language
            </label>
            <select
              id='language'
              className={clsx(!selectedLanguage && 'placeholder', errors.language && 'error')}
              defaultValue=''
              {...register('language', {
                required: true,
              })}
            >
              <option value='' disabled>
                {'Please select'}
              </option>
              {languagesAiForm.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.checkboxGroup}>
            <p className={clsx(styles.checkboxGroupLabel, errors.contactMethods && styles.red)}>
              Preferred Contact Method
            </p>

            {contactMethodOptions.map(option => (
              <label key={option.value} className={clsx('checkbox-wrap-xanova', styles.checkboxWrap)}>
                <input type='checkbox' value={option.value} {...contactMethodsRegister} />
                <span className='checkbox-xanova-box' />
                <span className='checkbox-xanova-text'>{option.label}</span>
              </label>
            ))}

            <div className='input-wrap-xanova'>
              <input
                id='other'
                type='text'
                autoComplete='off'
                className={errors.other ? 'error' : ''}
                placeholder='Type here..'
                {...otherRegister}
              />
            </div>
          </div>

          <button type='submit' className='btn-xanova gold'>
            {isLoading ? <span className='spinner-border' /> : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}
