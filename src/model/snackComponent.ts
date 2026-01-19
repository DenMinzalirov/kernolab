import { ReactNode } from 'react'
import { createEvent, createStore } from 'effector'

type Snack = ReactNode | null

export const $snackComponent = createStore<Snack>(null)

export const snackComponentChangedEv = createEvent<Snack>()

$snackComponent.on(snackComponentChangedEv, (_, p) => p)
