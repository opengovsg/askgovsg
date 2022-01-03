export const useGoogleAnalytics = () => {
  const GA_USER_EVENTS = {
    SEARCH: 'Search',
    ABANDONED: 'Abandoned Search',
    SUBMIT_ENQUIRY: 'Submit Enquiry',
    OPEN_ENQUIRY: 'Open Enquiry',
    CLICK_TAG: 'Click Tag',
    BROWSE: 'Browse',
    CLICK_TOPIC: 'Click Topic',
  }

  return {
    GA_USER_EVENTS,
    setGAUserId: () => undefined,
    sendPageView: () => undefined,
    sendUserEvent: () => undefined,
    sendTiming: () => undefined,
    sendException: () => undefined,
    appLoadTime: undefined,
    hasSearched: false,
  }
}
