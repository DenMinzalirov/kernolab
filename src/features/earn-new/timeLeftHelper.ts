import moment from 'moment/moment'

export const calculateTimeLeft = (expectedCloseDate: string) => {
  const now = moment() // Текущее время
  const expectedDate = moment(expectedCloseDate) // Ожидаемая дата закрытия
  const duration = moment.duration(expectedDate.diff(now)) // Разница между датами

  if (duration.asSeconds() <= 0) {
    return 0
  } else if (duration.asDays() >= 2) {
    return `${Math.floor(duration.asDays())} Days`
  } else if (duration.asDays() >= 1) {
    return `${Math.floor(duration.asDays())} Day`
  } else {
    const hours = duration.hours()
    const minutes = duration.minutes()
    return `${hours} h : ${minutes} m`
  }
}

export const calculateTimeLeftNumber = (expectedCloseDate: string) => {
  const now = moment() // Текущее время
  const expectedDate = moment(expectedCloseDate) // Ожидаемая дата закрытия
  const duration = moment.duration(expectedDate.diff(now)) // Разница между датами

  if (duration.asSeconds() <= 0) {
    return 0
  } else if (duration.asDays() >= 2) {
    return Math.floor(duration.asDays())
  } else {
    return 1
  }
}
