import { useEffect } from 'react'

// Where added, scroll to top of component
// https://reactrouter.com/web/guides/scroll-restoration
export function ScrollToTopOnMount(): null {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return null
}
