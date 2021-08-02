import { useEffect } from 'react'
import { useEnvironment } from './useEnvironment'
import * as FullStory from '@fullstory/browser'

export const useFullstory = (): void => {
  const { data: { fullStoryOrgId } = {} } = useEnvironment()
  useEffect(() => {
    if (fullStoryOrgId || fullStoryOrgId === '') {
      const isFullStoryOrgIdEmptyString = fullStoryOrgId === ''
      FullStory.init({
        // if empty orgId provided, init FullStory with fake orgId to disable it
        // supplying empty string will cause `orgId is a required parameter` error
        // enables other components to safely call FullStory methods even if not initialised
        // https://github.com/fullstorydev/fullstory-browser-sdk/issues/70
        orgId: isFullStoryOrgIdEmptyString ? 'XXX' : fullStoryOrgId,
      })
    }
  }, [fullStoryOrgId])
}
