import { HTMLAttributes, useEffect } from 'react'
import useLocalStorage from 'react-use-localstorage'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { MainLoader, Modal } from 'components'
import { pages } from 'constant'
import { clearRefreshToken, clearToken, getToken } from 'utils'

import { theme, themeValue } from '../../config'
import { resetStoresEv } from '../../model/auth-logout'
import { $mainLoader } from '../../model/mainLoader'

export function Layout({ children }: HTMLAttributes<HTMLElement>) {
  const mainLoader = useUnit($mainLoader)
  const navigate = useNavigate()
  const token = getToken()

  const [lastActivityTime, setLastActivityTime] = useLocalStorage('lastActivityTime')
  const handleUserActivity = () => {
    setLastActivityTime(Date.now().toString())
  }

  useEffect(() => {
    window.addEventListener('click', handleUserActivity)

    return () => {
      window.removeEventListener('click', handleUserActivity)
    }
  }, [])

  // A function to check the idle time and delete the token from localStorage
  const checkInactivity = () => {
    const currentTime = Date.now()
    const timeSinceLastActivity = currentTime - Number(lastActivityTime)
    const inactivityTimeLimit = 120 * 60 * 1000 // 120 minutes in milliseconds

    if (timeSinceLastActivity >= inactivityTimeLimit) {
      clearToken()
      clearRefreshToken()
      resetStoresEv()
      navigate(pages.Base.path)
      Modal.close()
    }
  }

  useEffect(() => {
    if (theme === themeValue.fideumOTC) {
      return
    }
    // Calling the idle time check function every 50 seconds
    const intervalId = setInterval(checkInactivity, 50000)

    return () => {
      clearInterval(intervalId)
    }
  }, [lastActivityTime])

  useEffect(() => {
    checkInactivity()
    if (!token) {
      // navigate(pages.Base.path)
    }
  }, [])

  if (mainLoader) return <MainLoader />

  return <main>{children}</main>
}
