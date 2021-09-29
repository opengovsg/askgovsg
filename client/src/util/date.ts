type HasCreatedAt = {
  createdAt: Date | string | number
}

export const sortByCreatedAt = (a: HasCreatedAt, b: HasCreatedAt): number =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
