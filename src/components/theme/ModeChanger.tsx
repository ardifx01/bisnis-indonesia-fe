/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'

import { useColorScheme } from '@mui/material/styles'

import { useSettings } from '@core/hooks/useSettings'

const ModeChanger = () => {
  const { setMode } = useColorScheme()
  const { settings } = useSettings()

  useEffect(() => {
    if (settings.mode) {
      setMode(settings.mode)
    }
  }, [settings.mode])

  return null
}

export default ModeChanger
