import { Button } from '../../components/button'
import { ToggleOption } from '../../components/toggle-option'
import { StatePreviewCard } from '../../components/state-preview-card'
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '../../components/card'

import preferencesStore from '../../stores/preferences-store'
import { getThemeTextClass } from '../../utils/theme-classes'
import {
  toggleNotifications,
  toggleAutoSave,
  resetPreferences,
} from './demo-actions'

interface PreferencesTabProps {
  theme: 'light' | 'dark'
}

export function PreferencesTab({ theme }: PreferencesTabProps) {
  const preferences = preferencesStore((data) => data)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Settings persisted in localStorage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border bg-linear-to-r from-purple-500/10 to-pink-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${getThemeTextClass(
                    theme,
                    'text-zinc-400',
                    'text-zinc-600'
                  )}`}
                >
                  Visit Count
                </p>
                <p className="text-2xl text-purple-500">
                  {preferences.visitCount}
                </p>
              </div>
              <span className="text-2xl">👋</span>
            </div>
          </div>

          <ToggleOption
            id="notifications"
            label="Notifications"
            description={
              preferences.notificationsEnabled ? 'Enabled' : 'Disabled'
            }
            checked={preferences.notificationsEnabled}
            onCheckedChange={toggleNotifications}
            theme={theme}
          />

          <ToggleOption
            id="autosave"
            label="Auto-save"
            description={preferences.autoSave ? 'Enabled' : 'Disabled'}
            checked={preferences.autoSave}
            onCheckedChange={toggleAutoSave}
            theme={theme}
          />

          <Button
            variant="destructive"
            onClick={resetPreferences}
            className="w-full"
          >
            Reset Preferences
          </Button>

          <p
            className={`text-xs ${getThemeTextClass(
              theme,
              'text-zinc-500',
              'text-zinc-600'
            )}`}
          >
            💡 Try refreshing the page - your preferences will persist!
          </p>
        </CardContent>
      </Card>

      <StatePreviewCard
        state={preferences}
        theme={theme}
        infoMessage={
          <>
            🔒 This store uses <strong>persist: true</strong> to save state
            across sessions
          </>
        }
        infoBorderColor="border-pink-500"
      />
    </div>
  )
}
