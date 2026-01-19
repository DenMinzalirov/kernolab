import moment from 'moment'

import { StakingUniqueFieldsResponse } from './hooks/type'

interface GroupedData {
  [key: string]: StakingUniqueFieldsResponse[]
}

type Section = {
  title: string
  data: StakingUniqueFieldsResponse[]
}

export const processAndGroupDataForStaking = (data: StakingUniqueFieldsResponse[], currentMonth: string) => {
  if (!data.length) return []

  const sections: Section[] = []

  const currentMonthData: StakingUniqueFieldsResponse[] = []
  const otherGroupedData: GroupedData = {}

  data.forEach(item => {
    const itemDate = moment(item.operationTime)
    const monthYear = itemDate.format('MMMM YYYY')

    if (monthYear === currentMonth) {
      currentMonthData.push(item)
    } else {
      if (!otherGroupedData[monthYear]) {
        otherGroupedData[monthYear] = []
      }
      otherGroupedData[monthYear].push(item)
    }
  })

  currentMonthData.sort((a, b) => moment(b.operationTime).diff(moment(a.operationTime)))

  if (currentMonthData.length > 0) {
    const groupedByDay = {} as GroupedData

    currentMonthData.forEach(item => {
      const day = moment(item?.operationTime).format('DD MMMM')
      if (!groupedByDay[day]) {
        groupedByDay[day] = []
      }

      groupedByDay[day].push(item)
    })

    Object.keys(groupedByDay).forEach(day => {
      sections.push({
        title: day,
        data: groupedByDay[day],
      })
    })
  }

  const sortedOtherGroupedData: GroupedData = {}
  Object.keys(otherGroupedData)
    .sort((a, b) => moment(b, 'MMMM YYYY').diff(moment(a, 'MMMM YYYY')))
    .forEach(key => {
      sortedOtherGroupedData[key] = otherGroupedData[key].sort((a, b) =>
        moment(b.operationTime).diff(moment(a.operationTime))
      )
    })

  Object.keys(sortedOtherGroupedData).forEach(monthYear => {
    sections.push({
      title: monthYear?.split(' ')[0],
      data: sortedOtherGroupedData[monthYear],
    })
  })

  return sections
}
