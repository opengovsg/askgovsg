import { useState, useEffect } from 'react'
import { device } from '../util/devicetype'

export const useDetectDevice = () => {
  const getCurrentDeviceSize = () => {
    return window.innerWidth < 480
      ? device.mobile
      : window.innerWidth < 1440
      ? device.tablet
      : device.desktop
  }

  const [deviceType, setDeviceType] = useState(getCurrentDeviceSize())

  const checkViewportSize = () => {
    setDeviceType(getCurrentDeviceSize())
  }

  useEffect(() => {
    window.addEventListener('resize', checkViewportSize)
    return () => window.removeEventListener('resize', checkViewportSize)
  }, [])

  return deviceType
}
