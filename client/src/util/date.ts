import moment, { MomentInput } from 'moment-timezone'

export const dateToDaysAgo = (date: MomentInput): number =>
  moment().diff(date, 'days')

export const dateToDaysAgoString = (date: MomentInput): string => {
  const daysAgo = dateToDaysAgo(date)
  if (daysAgo < 0) {
    return 'In the future'
  } else if (daysAgo <= 1) {
    return 'Less than 1 day ago'
  } else if (daysAgo < 30) {
    return `${daysAgo} days ago`
  } else {
    return moment(date).format('D MMM, YYYY')
  }
}

type HasCreatedAt = {
  createdAt: Date | string | number
}

export const sortByCreatedAt = (a: HasCreatedAt, b: HasCreatedAt): number =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
