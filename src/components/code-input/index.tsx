import React, { useCallback, useRef, useState } from 'react'
import clsx from 'clsx'

import { isBiz, isXanova } from 'config'

import stylesPairs from './styles.module.scss'
import stylesBiz from './styles-biz.module.scss'
import stylesXanova from './styles-xanova.module.scss'

type CodeInputProps = {
  onComplete: (code: string) => void
  errorMessage?: string
  setErrorMessage?: React.Dispatch<React.SetStateAction<string>>
}

export function CodeInput({ onComplete, errorMessage, setErrorMessage }: CodeInputProps) {
  const styles = isBiz ? stylesBiz : isXanova ? stylesXanova : stylesPairs

  const [values, setValues] = useState<string[]>(Array(6).fill(''))
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d$/.test(value) && value !== '') return // только цифры
    errorMessage && setErrorMessage ? setErrorMessage('') : null
    const newValues = [...values]
    newValues[index] = value
    setValues(newValues)

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }

    if (newValues.every(val => val) && index === 5) {
      onComplete(newValues.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (values[index] === '' && index > 0) {
        inputsRef.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const paste = e.clipboardData.getData('text').slice(0, 6).split('')
      const newValues = Array(6).fill('')
      paste.forEach((char, idx) => {
        if (/^\d$/.test(char)) {
          newValues[idx] = char
        }
      })
      setValues(newValues)
      if (newValues.every(val => val)) {
        onComplete(newValues.join(''))
      }
    },
    [onComplete]
  )

  return (
    <div className={styles.inputWrap}>
      {values.map((value, index) => (
        <input
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          id={`id${index}`}
          ref={el => {
            inputsRef.current[index] = el
          }}
          type='text'
          inputMode='numeric'
          placeholder='-'
          maxLength={1}
          value={value}
          onChange={e => handleInputChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={clsx(styles.input, { [styles.error]: errorMessage })}
        />
      ))}
    </div>
  )
}
