import { useEffect, useState } from 'react'
import { Controller, FieldValues } from 'react-hook-form'
import { get } from 'lodash'

import { CommonDropdown } from 'components'

import styles from './styles.module.scss'
import { FormFieldComponentProps, FormFieldOption } from './types'

export function SelectField<TFormData extends FieldValues = any>({
  methods,
  field,
  options = [],
}: FormFieldComponentProps<TFormData>) {
  const {
    control,
    formState: { errors },
    watch,
  } = methods

  const [selectedOption, setSelectedOption] = useState<FormFieldOption | null>(null)
  const fieldError = get(errors, field.fieldName)
  const watchValue = watch(field.fieldName)

  useEffect(() => {
    if (watchValue && typeof watchValue === 'string' && !selectedOption) {
      const foundOption = options.find(opt => opt.value === watchValue)
      if (foundOption) {
        setSelectedOption(foundOption)
      }
    }
  }, [watchValue, selectedOption, options])

  const itemComponent = (data: FormFieldOption) => {
    if (!data) return <div className={styles.countryCode}>{field.placeholder}</div>
    return (
      <div className={styles.countryCodeActive} style={{ padding: 10 }}>
        {data.label}
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
      <div
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          return null
        }}
      >
        <Controller
          name={field.fieldName}
          control={control}
          rules={{
            required: field.isRequired,
            ...(field.pattern ? { pattern: field.pattern } : {}),
          }}
          render={({ field: controllerField }) => (
            <CommonDropdown
              data={options}
              selectedData={selectedOption}
              itemComponent={itemComponent}
              setSelectedData={option => {
                setSelectedOption(option)
                controllerField.onChange(option?.value || '')
              }}
            />
          )}
        />
      </div>
    </div>
  )
}
