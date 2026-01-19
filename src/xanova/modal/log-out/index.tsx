import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Modal } from 'components'
import { pages } from 'constant'
import { clearRefreshToken, clearToken } from 'utils'
import { handleError } from 'utils/error-handler'
import { AuthServiceV4 } from 'wip/services'
import { resetStoresEv } from 'model/auth-logout'

import styles from './styles.module.scss'

type Props = {
  isGlobal?: boolean
}

export function LogOutModalXanova({ isGlobal }: Props) {
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)

  const handleLogOut = async () => {
    const logoutService = isGlobal ? AuthServiceV4.globalLogOut : AuthServiceV4.logOut

    setIsLoading(true)
    try {
      await logoutService()
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
      resetStoresEv()
      clearToken()
      clearRefreshToken()

      navigate(pages.SignIn.path)
      Modal.close()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <div className={styles.title}>Log Out of Your Account?</div>
        <div className={styles.description}>
          You’ll be signed out from this device. You can log back in anytime using your email and password.
        </div>
      </div>
      <div className={styles.actions}>
        <button type='button' className='btn-xanova red big' onClick={handleLogOut} disabled={isLoading}>
          {isLoading ? <span className='spinner-border' /> : 'Log out'}
        </button>
      </div>
    </div>
  )
}
