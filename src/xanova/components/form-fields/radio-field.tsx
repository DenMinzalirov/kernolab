import { FieldValues } from 'react-hook-form'
import { get } from 'lodash'
import clsx from 'clsx'

import { FormFieldComponentProps } from './types'

export function RadioField<TFormData extends FieldValues = any>({
  methods,
  field,
}: FormFieldComponentProps<TFormData>) {
  const {
    register,
    formState: { errors },
  } = methods

  const fieldError = get(errors, field.fieldName)

  if (!field.options || field.options.length === 0) {
    return null
  }

  const fieldName = String(field.fieldName)

  return (
    <div className='input-wrap-xanova'>
      <label className={fieldError ? 'text-error' : ''}>
        {field.fieldLabel} {fieldError?.type === 'required' && 'Required'}
      </label>
      <div className='radioGroup'>
        {field.options.map(option => (
          <label
            key={option.value}
            style={{ display: 'flex' }}
            className={clsx('radio-wrap-xanova')}
            htmlFor={`${fieldName}-${option.value}`}
          >
            <input
              id={`${fieldName}-${option.value}`}
              type='radio'
              value={option.value}
              {...register(field.fieldName, {
                required: field.isRequired,
              })}
            />
            <span className='radio-xanova-box' />
            <span className='radio-xanova-text'>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
