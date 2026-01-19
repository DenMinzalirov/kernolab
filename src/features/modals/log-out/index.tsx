import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { Modal } from 'components'
import { pages } from 'constant'
import { clearRefreshToken, clearToken } from 'utils'
import { handleError } from 'utils/error-handler'
import { AuthServiceV4 } from 'wip/services'
import { isBiz, isFideumOTC } from 'config'
import { resetStoresEv } from 'model/auth-logout'

import stylesFideum from './styles.module.scss'
import stylesBiz from './styles-biz.module.scss'

type Props = {
  isGlobal?: boolean
}

export function LogOutModal({ isGlobal }: Props) {
  const navigate = useNavigate()

  const styles = isBiz ? stylesBiz : stylesFideum

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

      navigate(isBiz || isFideumOTC ? pages.SignIn.path : pages.Base.path)
      Modal.close()
    }
  }

  return (
    <div className={styles.containerModal}>
      <div className={styles.title}>{isGlobal ? 'Confirm Log Out Everywhere' : 'Confirm Log Out'}</div>
      <div className={styles.description}>
        {isGlobal
          ? // eslint-disable-next-line max-len
            'Logging out everywhere will end your current sessions everywhere you\u2019re logged. You\u00A0will\u00A0need to\u00A0enter your credentials to access the\u00A0app again.'
          : // eslint-disable-next-line max-len
            'Logging out will end your current session and you\u00A0will\u00A0need to\u00A0enter your credentials to access the\u00A0app again.'}
      </div>

      <div className={styles.spacerLarge} />
      <button disabled={isLoading} className={clsx(isBiz ? 'btn-biz red' : 'btn-new red')} onClick={handleLogOut}>
        {isLoading ? (
          <span className='spinner-border' />
        ) : (
          <>
            <div>Log Out</div>
          </>
        )}
      </button>
      <div className={styles.buttonSpacer} />
      <button
        disabled={isLoading}
        className={clsx(isBiz ? 'btn-biz transparent' : 'btn-new transparent')}
        onClick={() => Modal.close()}
      >
        Cancel
      </button>
    </div>
  )
}
