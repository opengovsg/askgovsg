export const mergeTags = (agency: string | undefined, tags: string): string => {
  if (agency && tags) {
    return agency + ',' + tags
  }
  return agency || tags
}
