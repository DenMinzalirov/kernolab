import React, { useEffect } from 'react'

import { Spinner } from '../../components'
import { ErrorView } from './error-view'

type Props = {
  action: (confirmationCode: string) => Promise<void>
  errorMessage: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
}

export const PasswordSetting = ({ action, errorMessage, isLoading, setErrorMessage }: Props) => {
  useEffect(() => {
    action('')
  }, [])

  return (
    <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
      <ErrorView errorMessage={errorMessage} />
    </div>
  )
}
