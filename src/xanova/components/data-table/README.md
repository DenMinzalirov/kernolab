# DataTable

Компонент таблицы, который адаптируется под разные состояния и брейкпоинты. Поддерживает кастомные колонки, поиск,
триггер фильтров, пагинацию, индикатор загрузки и отображение пустого состояния.

## Ключевые возможности

- Настраиваемые колонки с собственными рендерами и алиасами данных.
- Автоматическое переключение между десктопной таблицей и карточками для планшета/мобилки.
- Управляемая пагинация (клиентская или серверная).
- Встроенный поиск и отдельный триггер для модального фильтра.
- Отображение состояния загрузки и пустой выдачи.

## Структура колонок

```ts
type TableColumn<T> = {
  id: string // уникальный идентификатор
  header: string // заголовок столбца
  dataKey?: keyof T // ключ поля в источнике данных
  render?: (row: T) => ReactNode // кастомный рендер, если dataKey недостаточно
  align?: 'left' | 'center' | 'right'
  responsive?: TableColumnResponsiveConfig<T>
}
```

### Responsive-конфиг

```ts
type TableColumnResponsiveConfig<T> = {
  tablet?: { hidden?: boolean; label?: string }
  mobile?: {
    hidden?: boolean
    label?: string // подпись для доп. полей
    slot?: 'primary' | 'secondary' | 'status' | 'collapsed'
    collapsedLabel?: keyof T | ((row: T) => ReactNode)
    collapsedValue?: keyof T | ((row: T) => ReactNode)
  }
}
```

- `hidden`: скрыть колонку на планшете/мобиле (значение по умолчанию — показывать).
- `label`: подпись, которая отображается в карточке при выводе скрытых полей.
- `slot`:
  - `primary` — главный заголовок карточки (первый ряд).
  - `secondary` — подпись под основным заголовком.
  - `status` — блок справа (обычно значок статуса).
  - `collapsed` — пара «лейбл + значение» под разделителем в закрытой карточке; при раскрытии попадает в список деталей.
    При необходимости можно задать `collapsedLabel` / `collapsedValue`, чтобы вывести отдельные значения в закрытом
    состоянии и сохранить исходное содержимое в раскрытом списке.
  - если слот не указан, колонка попадёт в список дополнительных деталей, доступных после раскрытия.

## Пропсы DataTable

| Проп                  | Тип                                           | Описание                                                     |
| --------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| `title`               | `string`                                      | Заголовок таблицы.                                           |
| `columns`             | `Array<TableColumn<T>>`                       | Описание колонок (обязательно).                              |
| `data`                | `T[]`                                         | Массив данных.                                               |
| `isLoading`           | `boolean`                                     | Включает состояние загрузки.                                 |
| `emptyState`          | `ReactNode`                                   | Контент для пустого состояния.                               |
| `rowKey`              | `(row: T, index: number) => string \| number` | Ключ строки; по умолчанию используется индекс.               |
| `searchConfig`        | `TableSearchConfig`                           | Объект с настройками поиска (плейсхолдер, хендлер, иконка).  |
| `filtersTrigger`      | `TableFiltersTrigger`                         | Отдельная кнопка (например, чтобы открыть модалку фильтров). |
| `pagination`          | `TablePaginationConfig`                       | Управляемая пагинация.                                       |
| `className`           | `string`                                      | Дополнительный класс-обёртка.                                |
| `disableTabletReflow` | `boolean`                                     | Отключить карточный режим на планшете.                       |
| `disableMobileReflow` | `boolean`                                     | Отключить карточный режим на мобилке.                        |

### Пагинация (`TablePaginationConfig`)

- `totalItems`, `currentPage`, `pageSize` — обязательные параметры для управления.
- `onPageChange(page)` — колбэк смены страницы.
- `onPageSizeChange(size)` — смена размера страницы (если нужно).
- `pageSizeOptions` — опции селектора «строк на страницу».
- `showSummary` — показывать краткую подпись `Showing X-Y of Z`.
- `mode`: `'client'` | `'server'`
  - По умолчанию `'client'` — таблица сама делает `slice`.
  - `'server'` — вы отдаёте уже готовый срез и управляете страницами снаружи.

## Поиск и триггер фильтров

- `searchConfig` — показывает компактный инпут с дебаунсом в 300 мс и пользовательской иконкой.
- `filtersTrigger` — отдельная кнопка, часто используется для открытия правой модалки (как в дизайне Xanova).

## Поведение на брейкпоинтах

- **Десктоп** — классическая таблица с заголовком и строками.
- **Планшет** — сетка карточек с раскрывающимися деталями; колонки, помеченные `tablet.hidden`, уходят в «подвал»
  карточки.
- **Мобилка** — вертикальные карточки:
  - слот `primary` / `secondary` — верхние строки контента;
  - слот `status` — блок справа (можно поместить бейдж/иконку);
  - детали с `mobile.hidden` или без слота помещаются в раскрывающийся список;
  - слот `collapsed` — дополнительная пара «лейбл/значение» под разделителем в закрытом состоянии. При раскрытии деталь
    переезжает в общий список.
- При необходимости можно отключить перераскладку через `disableTabletReflow` / `disableMobileReflow`.

## Базовый пример

```tsx
import { useState } from 'react'
import { Modal } from 'components'
import { DataTable, TableColumn, TablePaginationConfig } from 'xanova/components/data-table'
import searchIcon from './search-icon.svg'

type UserRow = {
  id: string
  name: string
  email: string
  status: string
}

const columns: Array<TableColumn<UserRow>> = [
  {
    id: 'name',
    header: 'Имя',
    dataKey: 'name',
    responsive: { mobile: { slot: 'primary', label: 'Имя' } },
  },
  {
    id: 'email',
    header: 'E-mail',
    dataKey: 'email',
    responsive: { mobile: { slot: 'secondary', label: 'E-mail' } },
  },
  {
    id: 'status',
    header: 'Статус',
    dataKey: 'status',
    responsive: { mobile: { slot: 'status', label: 'Статус' } },
  },
]

const pagination: TablePaginationConfig = {
  totalItems,
  currentPage,
  pageSize,
  onPageChange: setCurrentPage,
  onPageSizeChange: setPageSize,
  pageSizeOptions: [10, 25, 50],
  showSummary: false,
}

const handleOpenFilters = () => {
  Modal.open(<div>Фильтры</div>, { title: '', variant: 'right' })
}

;<DataTable<UserRow>
  title='Пользователи'
  data={users}
  columns={columns}
  isLoading={isFetching}
  emptyState='Нет данных'
  searchConfig={{
    placeholder: 'Поиск по имени',
    onSearch: handleSearch,
    icon: <img alt='search' src={searchIcon} />,
  }}
  filtersTrigger={{
    label: 'Фильтры',
    onClick: handleOpenFilters,
  }}
  pagination={pagination}
  rowKey={row => row.id}
/>
```

> **Замечание.** Если используете серверную пагинацию, не забывайте передавать актуальные `totalItems` и `currentPage`
> при каждом ответе сервера.
