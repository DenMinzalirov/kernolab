import { HTMLAttributes, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { pages } from 'constant'
import { getToken, parseJwt } from 'utils'

import { NavPanel } from '../nav-panel'
import styles from './styles.module.scss'

export function Main({ children }: HTMLAttributes<HTMLDivElement>) {
  const navigate = useNavigate()

  useEffect(() => {
    const token = getToken()

    // if (!token) {
    //   navigate(pages.Base.path)
    // }

    const parsedToken = parseJwt(token)
    const scope = parsedToken?.scope

    if (scope && scope.length && !scope.includes('EMAIL')) {
      navigate(pages.ConfirmationCode.path)
    }

    if (scope && scope.length && !scope.includes('KYC')) {
      navigate(pages.KYC.path)
    }
  }, [])

  return (
    <div className={styles.main}>
      <>
        <NavPanel />
        {children}
      </>
    </div>
  )
}
