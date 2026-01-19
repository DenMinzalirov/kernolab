import { createEvent, createStore } from 'effector'

export const $mainLoader = createStore(true)

export const mainLoaderChangedEv = createEvent<boolean>()

$mainLoader.on(mainLoaderChangedEv, (_, p) => p)
