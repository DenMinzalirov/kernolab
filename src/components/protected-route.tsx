import type { JSX, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { pages } from 'constant'
import { getToken, parseJwt } from 'utils'

const protectionType = {
  user: 'user',
  guest: 'guest',
  multiple: 'multiple',
} as const

type ProtectionType = keyof typeof protectionType

interface ProtectedRouteProps {
  element: ReactNode
  type: ProtectionType
}

export function ProtectedRoute({ element, type }: ProtectedRouteProps): JSX.Element | null {
  const token = getToken()
  const parsedToken = parseJwt(token)
  const scope = parsedToken?.scope

  // if (!scope?.includes('MEMBER')) {
  //   return <Navigate to={pages.MEMBERSHIP.path} replace />
  // }

  if (type === protectionType.multiple) {
    return <>{element}</>
  }

  if (!token && type === protectionType.user) {
    return <Navigate to={pages.SignIn.path} replace />
  }

  return <>{element}</>
}
