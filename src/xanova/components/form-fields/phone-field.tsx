import { useEffect, useState } from 'react'
import { Controller, FieldValues } from 'react-hook-form'
import { get } from 'lodash'

import { CommonDropdown } from 'components'

import { countriesArray, Country, getCountryByPhoneNumber } from '../../../features/modals/travel-rule-form/countries'
import styles from './styles.module.scss'
import { FormFieldComponentProps } from './types'

export function PhoneField<TFormData extends FieldValues = any>({
  methods,
  field,
}: FormFieldComponentProps<TFormData>) {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = methods

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [previousCountry, setPreviousCountry] = useState<Country | null>(null)
  const fieldError = get(errors, field.fieldName)
  const watchValue = watch(field.fieldName)

  useEffect(() => {
    if (watchValue && typeof watchValue === 'string' && !selectedCountry) {
      const phoneData = getCountryByPhoneNumber(watchValue)
      if (phoneData) {
        setSelectedCountry(phoneData.country)
        setPreviousCountry(phoneData.country)
      }
    }
  }, [watchValue, selectedCountry])

  useEffect(() => {
    if (selectedCountry && previousCountry && selectedCountry.phoneCode !== previousCountry.phoneCode) {
      setValue(field.fieldName, selectedCountry.phoneCode as any)
      setPreviousCountry(selectedCountry)
    }
  }, [selectedCountry, previousCountry, field.fieldName, setValue])

  const itemComponent = (data: Country) => {
    if (!data) return <div className={styles.countryCode}>Country Code</div>
    return (
      <div className={styles.countryCodeActive} style={{ padding: 10 }}>
        {data.flag}&nbsp;{data.phoneCode}
      </div>
    )
  }

  const fieldName = String(field.fieldName)

  return (
    <div className='input-wrap-xanova'>
      <label htmlFor={fieldName} className={fieldError ? 'text-error' : ''}>
        {field.fieldLabel} {fieldError?.type === 'pattern' && 'Invalid'}
        {fieldError?.type === 'required' && 'Required'}
        {fieldError?.type === 'validate' && (String(fieldError.message) || 'Invalid')}
      </label>
      <div style={{ display: 'flex', gap: 10 }}>
        <div
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
            return null
          }}
        >
          <CommonDropdown
            data={countriesArray}
            selectedData={selectedCountry}
            itemComponent={itemComponent}
            setSelectedData={setSelectedCountry}
          />
        </div>
        <Controller
          name={field.fieldName}
          control={control}
          rules={{
            required: field.isRequired,
            validate: value => {
              if (field.isRequired && !selectedCountry) return 'Choose phone code.'
              if (typeof value === 'string') {
                const phoneOnly = value.replace(/[^+\d]/g, '').replace(selectedCountry?.phoneCode || '', '')
                if (phoneOnly && (phoneOnly.length < 5 || phoneOnly.length > 16)) {
                  return 'Phone number must be between 5 and 16 characters long.'
                }
              }
            },
            ...(field.pattern ? { pattern: field.pattern } : {}),
          }}
          render={({ field: controllerField }) => (
            <input
              id={fieldName}
              style={{ width: '100%' }}
              type='text'
              className={fieldError ? 'error' : ''}
              placeholder={field.placeholder}
              value={
                typeof controllerField.value === 'string'
                  ? controllerField.value.replace(selectedCountry?.phoneCode || '', '')
                  : ''
              }
              onChange={e => {
                const cleanedValue = e.target.value.replace(/[^0-9]+/g, '')
                const fullPhone = (selectedCountry?.phoneCode || '') + cleanedValue.replace(/[^+\d]/g, '')
                controllerField.onChange(fullPhone)
              }}
              onBlur={controllerField.onBlur}
            />
          )}
        />
      </div>
    </div>
  )
}
