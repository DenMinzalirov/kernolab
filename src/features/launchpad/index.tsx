import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { HeaderTitle } from '../../components'
import { useCurrentBreakpointPairs } from '../../hooks/use-current-breakpoint-pairs'
import { $allocationsLaunchpads, $launchpads } from '../../model/launchpads'
import { getToken } from '../../utils'
import { MobileAppLanding } from '../mobile-app-landing'
import { LaunchpadEventItem } from './launchpad-event-item'
import { LaunchpadFilters } from './launchpad-filters'
import { NothingLaunchpad } from './nothing-launchpad'
import styles from './styles.module.scss'

const PROJECT_STATUSES: Record<string, string> = {
  All: 'All',
  ACTIVE: 'Active',
  COMING_SOON: 'Coming Soon',
  FULLY_RAISED: 'Completed',
  FINISHED: 'Completed',
  NOT_RAISED: 'Completed',
  CANCELED: 'Completed',
}

const PROJECT_MY_STATUSES: Record<string, string> = {
  All: 'All',
  ACTIVE: 'Active',
  FULLY_RAISED: 'Fully Raised',
  FINISHED: 'Terminated',
  NOT_RAISED: 'Not Raised',
  CANCELED: 'Terminated',
}

export const STATUSES_FILTER = {
  ALL: 'All',
  ACTIVE: 'Active',
  COMING_SOON: 'Coming Soon',
  COMPLETED: 'Completed',
}

export const STATUSES_MY_FILTER = {
  ALL: 'All',
  ACTIVE: 'Active',
  FULLY_RAISED: 'Fully Raised',
  TERMINATED: 'Terminated',
  NOT_RAISED: 'Not Raised',
}

export function Launchpad() {
  const token = getToken()
  const location = useLocation()
  const launchpads = useUnit($launchpads)
  const allocationsLaunchpads = useUnit($allocationsLaunchpads)
  const [projectsAllocationFilter, setProjectsAllocationFilter] = useState(
    location?.state?.isMyInvestments ? 'MY' : 'ALL'
  )
  const myProjects = allocationsLaunchpads
    .filter(allocationsLaunchpad => +allocationsLaunchpad.totalPurchasedAmount > 0)
    .map(allocationsLaunchpad => allocationsLaunchpad.projectUuid)
  const [statusFilter, setStatusFilter] = useState(STATUSES_FILTER.ACTIVE)

  const showedLaunchpads = launchpads
    .filter(launchpad => {
      if (projectsAllocationFilter === 'ALL') return true
      return myProjects.includes(launchpad.projectId)
    })
    .filter(launchpad => {
      if (statusFilter === 'All') return true
      if (projectsAllocationFilter === 'MY') {
        return PROJECT_MY_STATUSES[launchpad.status] === statusFilter
      }
      return PROJECT_STATUSES[launchpad.status] === statusFilter
    })

  const nothingLaunchpadDescription = () => {
    if (projectsAllocationFilter === 'ALL') return 'New projects are coming soon.'
    if (projectsAllocationFilter === 'MY' && !token) return 'Please Sign In to view your Investments'
    if (projectsAllocationFilter === 'MY' && token) return ''
    return 'New projects are coming soon.'
  }

  const list = projectsAllocationFilter === 'ALL' ? Object.values(STATUSES_FILTER) : Object.values(STATUSES_MY_FILTER)

  const { isMobilePairs, isTabletPairs } = useCurrentBreakpointPairs()

  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle='Launchpad' />

      <div className={styles.contentWrap}>
        <div className={styles.contentHeader}>
          <div style={{ display: 'flex', gap: 24 }}>
            <div
              onClick={() => {
                setProjectsAllocationFilter('ALL')
                setStatusFilter(STATUSES_FILTER.ALL)
              }}
              className={clsx(
                styles.projectTitleFilter,
                projectsAllocationFilter === 'ALL' ? styles.projectTitleFilterActive : ''
              )}
            >
              Projects
            </div>
            <div
              onClick={() => {
                setProjectsAllocationFilter('MY')
                setStatusFilter(STATUSES_FILTER.ALL)
              }}
              className={clsx(
                styles.projectTitleFilter,
                projectsAllocationFilter === 'MY' ? styles.projectTitleFilterActive : ''
              )}
            >
              My Investments
            </div>
          </div>
          <LaunchpadFilters statusFilter={statusFilter} setStatusFilter={setStatusFilter} list={list} />
        </div>
        {showedLaunchpads.length ? (
          <div className={styles.cardsWrap}>
            {showedLaunchpads
              .sort((a, b) => {
                return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
              })
              .map(launchpad => {
                return <LaunchpadEventItem key={launchpad.projectId} launchpad={launchpad} />
              })}
          </div>
        ) : (
          <NothingLaunchpad description={nothingLaunchpadDescription()} />
        )}
      </div>
    </div>
  )
}
