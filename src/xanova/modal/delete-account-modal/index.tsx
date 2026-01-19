import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { Modal } from 'components'
import { pages } from 'constant'
import { AuthServiceV4 } from 'wip/services'

import styles from './styles.module.scss'

type Step = 'intro' | 'confirmInput' | 'servicesWarning'

type Inputs = {
  confirmValue: string
}

const defaultValues: Inputs = {
  confirmValue: '',
}

export function DeleteAccountModalXanova() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('intro')
  const [confirmValue, setConfirmValue] = useState(defaultValues.confirmValue)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleCancel = () => {
    if (isLoading) return
    Modal.close()
  }

  const handlePrepare = () => {
    setStep('servicesWarning')
    setErrorMessage(null)
  }

  const handleContinue = () => {
    setStep('confirmInput')
    setConfirmValue(defaultValues.confirmValue)
    setErrorMessage(null)
  }

  const handleGlobalLogOut = async () => {
    try {
      await AuthServiceV4.globalLogOut()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
    navigate(pages.SignIn.path)
    Modal.close()
  }

  const renderSuccessDelete = () => {
    return (
      <div className={styles.container}>
        <div className={styles.heading}>
          <div className={styles.title}>Your account has been deleted</div>
          <div className={styles.description}>
            We&apos;re sorry to see you go. Your account is now permanently closed. If you change your mind, you&apos;ll
            need to create a new account to access our services again.
          </div>
        </div>

        <div className={styles.actions}>
          <button type='button' className='btn-xanova gold big' onClick={handleGlobalLogOut}>
            Return to Homepage
          </button>
        </div>
      </div>
    )
  }

  const handleDeleteConfirm = async () => {
    if (isLoading) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      await AuthServiceV4.deleteAccount()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }

    //show success message modal
    Modal.open(renderSuccessDelete(), {
      variant: 'center',
      customCloseModal: handleGlobalLogOut,
    })
  }

  const renderContent = () => {
    switch (step) {
      case 'intro':
        return (
          <>
            <div className={styles.heading}>
              <div className={styles.title}>Are you sure you want to delete your account?</div>
              <div className={styles.description}>
                This action is permanent. Your profile, documents, and referral history will be permanently removed. You
                will no longer have access to commissions, payouts, or services.
              </div>
            </div>

            <div className={styles.actions}>
              <button type='button' className='btn-xanova red big' onClick={handleCancel}>
                Cancel
              </button>
              <button type='button' className='btn-xanova red text-only big' onClick={handleContinue}>
                Continue to Delete
              </button>
            </div>
          </>
        )

      case 'confirmInput':
        return (
          <>
            <div className={styles.heading}>
              <div className={styles.title}>Confirm Account Deletion</div>
              <div className={styles.description}>
                Please type &rdquo;Delete&rdquo; to confirm you want to permanently delete your account. This action
                cannot be undone.
              </div>
            </div>

            <div className={clsx('input-wrap-xanova', styles.inputWrap)}>
              <input
                value={confirmValue}
                onChange={event => setConfirmValue(event.target.value)}
                placeholder='Type "Delete" here..'
              />
            </div>

            <div className={styles.actions}>
              <button type='button' className='btn-xanova red big' onClick={handleCancel}>
                Cancel
              </button>
              <button
                type='button'
                className='btn-xanova red text-only big'
                onClick={handlePrepare}
                disabled={confirmValue !== 'Delete'}
              >
                Delete Account
              </button>
            </div>
          </>
        )

      case 'servicesWarning':
        return (
          <>
            <div className={styles.heading}>
              <div className={styles.title}>Confirm Account Deletion</div>
              <div className={styles.description}>
                Your account is connected to active services (Insurance, Trading). Deleting your account will also
                terminate your access to these services. Please confirm to continue.
              </div>
            </div>

            {errorMessage && <div className={styles.error}>{errorMessage}</div>}

            <div className={styles.actions}>
              <button type='button' className='btn-xanova gold big' onClick={handleDeleteConfirm} disabled={isLoading}>
                {isLoading ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return <div className={styles.container}>{renderContent()}</div>
}
