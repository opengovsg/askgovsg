import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Where added, scroll to top on each new page
// https://reactrouter.com/web/guides/scroll-restoration
export default function ScrollToTop(): null {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
