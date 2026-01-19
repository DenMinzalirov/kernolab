import { FieldValues } from 'react-hook-form'
import { get } from 'lodash'

import { FormFieldComponentProps } from './types'

export function TextField<TFormData extends FieldValues = any>({ methods, field }: FormFieldComponentProps<TFormData>) {
  const {
    register,
    formState: { errors },
  } = methods

  const fieldError = get(errors, field.fieldName)

  const fieldName = String(field.fieldName)

  return (
    <div className='input-wrap-xanova'>
      <label htmlFor={fieldName} className={fieldError ? 'text-error' : ''}>
        {field.fieldLabel} {fieldError?.type === 'pattern' && 'Invalid'}
        {fieldError?.type === 'required' && 'Required'}
      </label>
      <input
        id={fieldName}
        type={field.type || 'text'}
        className={fieldError ? 'error' : ''}
        placeholder={field.placeholder}
        {...register(field.fieldName, {
          required: field.isRequired,
          ...(field.pattern ? { pattern: field.pattern } : {}),
        })}
      />
    </div>
  )
}
