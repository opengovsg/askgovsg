import { useState, useEffect } from 'react'

export enum DeviceType {
  Mobile = 'mobile',
  Tablet = 'tablet',
  Desktop = 'desktop',
}

export const useDetectDevice = () => {
  const getCurrentDeviceSize = () => {
    return window.innerWidth < 480
      ? DeviceType.Mobile
      : window.innerWidth < 1440
      ? DeviceType.Tablet
      : DeviceType.Desktop
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
