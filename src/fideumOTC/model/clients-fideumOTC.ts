import { createEffect, createEvent, createStore, sample } from 'effector'

import {
  OTCClient,
  OTCClientQueryParams,
  OTCClientStatus,
  OTCTradeServices,
  PageOTCClient,
} from '../../wip/services/fideumOTC-services/OTC-trade'

const testClientsData: OTCClient[] = [
  {
    clientUuid: '550e8400-e29b-41d4-a716-446655440001',
    applicantId: 'APP001',
    status: OTCClientStatus.CONFIRMED,
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z',
  },
  {
    clientUuid: '550e8400-e29b-41d4-a716-446655440002',
    applicantId: 'APP002',
    status: OTCClientStatus.PENDING,
    email: 'jane.smith@example.com',
    fullName: 'Jane Smith',
    createdAt: '2025-01-14T09:15:00.000Z',
    updatedAt: '2025-01-14T09:15:00.000Z',
  },
]

export const $clientsOTC = createStore<OTCClient[]>([])
export const $clientsOTCChangedEv = createEvent<[]>()

// Стор для хранения информации о пагинации клиентов
export const $paginationInfoClients = createStore<{
  currentPage: number
  totalPages: number
  totalElements: number
  size: number
}>({
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  size: 50,
})

// Стор для хранения параметров запроса клиентов (пагинация и сортировка)
export const $clientsQueryParams = createStore<OTCClientQueryParams>({
  sort: 'createdAt,desc',
  size: 50,
  page: 0,
})

// События для управления параметрами
export const clientsPageChangedEv = createEvent<number>()
export const clientsSortChangedEv = createEvent<string>()

// Обновляем параметры при изменении страницы
$clientsQueryParams.on(clientsPageChangedEv, (state, page) => ({
  ...state,
  page,
}))

// Обновляем параметры при изменении сортировки
$clientsQueryParams.on(clientsSortChangedEv, (state, sort) => ({
  ...state,
  sort,
  page: 0, // Сбрасываем на первую страницу при изменении сортировки
}))

// Эффект для загрузки данных клиентов с пагинацией
export const clientsOTCDataFx = createEffect(async (params: OTCClientQueryParams): Promise<PageOTCClient> => {
  const data = await OTCTradeServices.getOTCClients(params)
  return data
})

// Событие для принудительного обновления данных
export const refreshClientsEv = createEvent()

// Автоматически применяем параметры при их изменении или при принудительном обновлении
sample({
  clock: [$clientsQueryParams, refreshClientsEv],
  source: $clientsQueryParams,
  target: clientsOTCDataFx,
})

// Обновляем данные клиентов и информацию о пагинации
$clientsOTC.on(clientsOTCDataFx.doneData, (_, pageData) => pageData.content).on($clientsOTCChangedEv, (s, p) => p)

// Обновляем информацию о пагинации
$paginationInfoClients.on(clientsOTCDataFx.doneData, (_, pageData) => ({
  currentPage: pageData.number,
  totalPages: pageData.totalPages,
  totalElements: pageData.totalElements,
  size: pageData.size,
}))

// Удобные функции для использования в компонентах
export const refreshClients = () => refreshClientsEv()
export const changeClientsPage = (page: number) => clientsPageChangedEv(page)
export const changeClientsSort = (sort: string) => clientsSortChangedEv(sort)

// ============================================
// Логика для поиска клиентов (ClientSearch компонент)
// ============================================

// Стор для всех клиентов (используется в компоненте поиска)
export const $clientsForSearch = createStore<OTCClient[]>([])

// Событие для поиска клиентов
export const searchClientsEv = createEvent<string>()

// Эффект для загрузки всех клиентов (первые 2000)
export const loadAllClientsForSearchFx = createEffect(async (): Promise<OTCClient[]> => {
  const data = await OTCTradeServices.getOTCClients({
    sort: 'createdAt,desc',
    size: 2000,
    page: 0,
  })
  return data.content
})

// Эффект для поиска клиентов на сервере по email и fullName
export const searchClientsFx = createEffect(async (searchTerm: string): Promise<OTCClient[]> => {
  if (!searchTerm || searchTerm.trim().length === 0) {
    // Если поисковый запрос пустой, загружаем все клиенты
    const data = await OTCTradeServices.getOTCClients({
      sort: 'createdAt,desc',
      size: 2000,
      page: 0,
    })
    return data.content
  }

  // Выполняем два параллельных запроса для OR логики (email OR fullName)
  const [emailResults, fullNameResults] = await Promise.all([
    OTCTradeServices.getOTCClients({
      email_ilike: `%${searchTerm}%`,
      sort: 'createdAt,desc',
      size: 2000,
      page: 0,
    }),
    OTCTradeServices.getOTCClients({
      fullName_ilike: `%${searchTerm}%`,
      sort: 'createdAt,desc',
      size: 2000,
      page: 0,
    }),
  ])

  // Объединяем результаты и удаляем дубликаты по clientUuid
  const allClients = [...emailResults.content, ...fullNameResults.content]
  const uniqueClients = allClients.filter(
    (client, index, self) => index === self.findIndex(c => c.clientUuid === client.clientUuid)
  )

  return uniqueClients
})

// Обновляем стор при загрузке всех клиентов
$clientsForSearch.on(loadAllClientsForSearchFx.doneData, (_, clients) => clients)

// Обновляем стор при поиске клиентов
$clientsForSearch.on(searchClientsFx.doneData, (_, clients) => clients)

// Автоматический поиск при изменении поискового запроса
sample({
  clock: searchClientsEv,
  target: searchClientsFx,
})

// Удобные функции для использования в компоненте ClientSearch
export const loadAllClientsForSearch = () => loadAllClientsForSearchFx()
export const searchClients = (searchTerm: string) => searchClientsEv(searchTerm)
