import { ToggleOption } from '../../components/toggle-option'
import { StatePreviewCard } from '../../components/state-preview-card'
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '../../components/card'

import { toggleTheme } from './demo-actions'
import themeStore from '../../stores/theme-store'
import { getThemeTextClass } from '../../utils/theme-classes'

interface ThemeTabProps {
  theme: 'light' | 'dark'
}

export function ThemeTab({ theme }: ThemeTabProps) {
  const themeState = themeStore((data) => data)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Control</CardTitle>
          <CardDescription>Toggle between light and dark modes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleOption
            id="theme-toggle"
            label="Current Theme"
            description={
              themeState.theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'
            }
            checked={themeState.theme === 'dark'}
            onCheckedChange={toggleTheme}
            theme={theme}
          />

          <p
            className={`text-sm ${getThemeTextClass(
              theme,
              'text-zinc-500',
              'text-zinc-600'
            )}`}
          >
            Toggle the switch to see the entire page theme change instantly
            across all components.
          </p>
        </CardContent>
      </Card>

      <StatePreviewCard
        state={themeState}
        theme={theme}
        infoMessage={
          <>
            Currently viewing in <strong>{themeState.theme}</strong> mode
          </>
        }
        infoBorderColor="border-purple-500"
      />
    </div>
  )
}
