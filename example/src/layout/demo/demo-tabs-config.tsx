import { User, Palette, Settings } from 'lucide-react'

import type { TabValue } from '../../hooks/useTabFromUrl'

interface TabConfig {
  value: TabValue
  icon: typeof User
  label: string
}

export const tabsConfig: TabConfig[] = [
  {
    value: 'user',
    icon: User,
    label: 'User Store',
  },
  {
    value: 'theme',
    icon: Palette,
    label: 'Theme Store',
  },
  {
    value: 'preferences',
    icon: Settings,
    label: 'Preferences',
  },
]
