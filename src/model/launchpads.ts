import { createEffect, createStore } from 'effector'

import {
  LaunchpadProject,
  LaunchpadService,
  LaunchpadsRequest,
  LaunchpadUserAllocation,
  PageLaunchpadUserAllocation,
  ShortLaunchpadProject,
} from '../wip/services/launchpads'

// all launchpads
export const $launchpads = createStore<ShortLaunchpadProject[]>([])

export const getLaunchpadsFx = createEffect(async (pages: LaunchpadsRequest) => {
  const response = await LaunchpadService.getLaunchpads(pages)
  return response.content
})

$launchpads.on(getLaunchpadsFx.doneData, (s, p) => p)

// all allocations launchpads
export const $allocationsLaunchpads = createStore<LaunchpadUserAllocation[]>([])

export const getAllocationsLaunchpadsFx = createEffect(async (pages: LaunchpadsRequest) => {
  const response = await LaunchpadService.getAllocationsLaunchpads(pages)
  return response.content
})

$allocationsLaunchpads.on(getAllocationsLaunchpadsFx.doneData, (s, p) => p)

// single current launchpad
export const $currentLaunchpad = createStore<LaunchpadProject | null>(null)

export const getLaunchpadFx = createEffect(async (projectUuid: string) => {
  return await LaunchpadService.getLaunchpad(projectUuid)
})

$currentLaunchpad.on(getLaunchpadFx.doneData, (s, p) => p)

// allocation launchpad
export const $allocationLaunchpad = createStore<LaunchpadUserAllocation | null>(null)

export const getAllocationLaunchpadFx = createEffect(async (projectUuid: string) => {
  return await LaunchpadService.getAllocationLaunchpad(projectUuid)
})

$allocationLaunchpad.on(getAllocationLaunchpadFx.doneData, (s, p) => p)
