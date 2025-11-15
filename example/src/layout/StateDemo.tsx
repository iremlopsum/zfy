import { useState } from 'react'
import { Code2, User, Palette, Settings } from 'lucide-react'

import { CodeBlock } from './CodeBlock'
import { Label } from '../components/label'
import { Input } from '../components/input'
import { Button } from '../components/button'
import { Switch } from '../components/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/tabs'
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '../components/card'

import userStore from '../stores/user-store'
import themeStore from '../stores/theme-store'
import preferencesStore from '../stores/preferences-store'

interface StateDemoProps {
  theme: 'light' | 'dark'
}

export function StateDemo({ theme }: StateDemoProps) {
  const [showCode, setShowCode] = useState(false)
  const user = userStore((data) => data)
  const themeState = themeStore((data) => data)
  const preferences = preferencesStore((data) => data)

  const updateUser = userStore.getState().update
  const updateTheme = themeStore.getState().update
  const updatePreferences = preferencesStore.getState().update

  const incrementAge = () => {
    updateUser((data) => {
      data.age += 1
    })
  }

  const decrementAge = () => {
    updateUser((data) => {
      data.age = Math.max(0, data.age - 1)
    })
  }

  const toggleTheme = () => {
    updateTheme((data) => {
      data.theme = data.theme === 'light' ? 'dark' : 'light'
    })
  }

  const updateName = (name: string) => {
    updateUser((data) => {
      data.name = name
    })
  }

  const toggleNotifications = () => {
    updatePreferences((data) => {
      data.notificationsEnabled = !data.notificationsEnabled
    })
  }

  const toggleAutoSave = () => {
    updatePreferences((data) => {
      data.autoSave = !data.autoSave
    })
  }

  const resetUser = () => {
    userStore().reset()
  }

  const resetPreferences = () => {
    preferencesStore().reset()
  }

  const storeCode = `import { createStore } from '@colorfy-software/zfy';
import { createJSONStorage } from 'zustand/middleware';

// User Store
interface UserState {
  name: string;
  age: number;
}

const userStore = createStore<UserState>('user', {
  name: 'Alice',
  age: 25
});

// Theme Store
interface ThemeState {
  theme: 'light' | 'dark';
}

const themeStore = createStore<ThemeState>('theme', {
  theme: 'dark'
});

// Preferences Store with persistence
interface PreferencesState {
  visitCount: number;
  notificationsEnabled: boolean;
  autoSave: boolean;
}

const preferencesStore = createStore<PreferencesState>(
  'preferences',
  {
    visitCount: 0,
    autoSave: true,
    notificationsEnabled: true
  },
  {
    persist: {
      name: 'zfy-preferences',
      storage: createJSONStorage(() => localStorage)
    }
  }
);`

  const usageCode = `// Using multiple stores in components
function MyComponent() {
  const user = userStore((data) => data);
  const theme = themeStore((data) => data.theme);
  const preferences = preferencesStore((data) => data);
  
  const updateUser = userStore.getState().update;
  
  const incrementAge = () => {
    updateUser((data) => {
      data.age += 1;  // ✨ Immer-powered updates
    });
  };
  
  return (
    <div>
      <p>{user.name} is {user.age} years old</p>
      <p>Visits: {preferences.visitCount}</p>
    </div>
  );
}`

  return (
    <div className="mb-20">
      <div className="flex items-center justify-center gap-3 mb-8">
        <h2
          className={`text-2xl text-center ${
            theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'
          }`}
        >
          Interactive Demo
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowCode(!showCode)}
        >
          <Code2 />
        </Button>
      </div>

      <div className="max-w-5xl mx-auto">
        {showCode ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CodeBlock title="Store Creation" code={storeCode} theme={theme} />
            <CodeBlock title="Usage Example" code={usageCode} theme={theme} />
          </div>
        ) : (
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="user" className="gap-2">
                <User className="w-4 h-4" />
                User Store
              </TabsTrigger>
              <TabsTrigger value="theme" className="gap-2">
                <Palette className="w-4 h-4" />
                Theme Store
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <Settings className="w-4 h-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User State</CardTitle>
                    <CardDescription>Manage user information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={user.name}
                        onChange={(e) => updateName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Age: {user.age}</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={decrementAge}
                          className="flex-1"
                        >
                          -1
                        </Button>
                        <Button onClick={incrementAge} className="flex-1">
                          +1
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      onClick={resetUser}
                      className="w-full"
                    >
                      Reset User
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>State Preview</CardTitle>
                    <CardDescription>Current store values</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`rounded-lg p-4 ${
                        theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-100'
                      }`}
                    >
                      <pre
                        className={`text-sm ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                        }`}
                      >
                        <code>{JSON.stringify(user, null, 2)}</code>
                      </pre>
                    </div>
                    <div className="mt-4 p-4 rounded-lg border-l-4 border-purple-500 bg-purple-500/10">
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                        }`}
                      >
                        <strong>{user.name}</strong> is{' '}
                        <strong>{user.age}</strong> years old
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="theme" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Control</CardTitle>
                    <CardDescription>
                      Toggle between light and dark modes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="space-y-0.5">
                        <Label>Current Theme</Label>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                          }`}
                        >
                          {themeState.theme === 'dark'
                            ? '🌙 Dark Mode'
                            : '☀️ Light Mode'}
                        </p>
                      </div>
                      <Switch
                        checked={themeState.theme === 'dark'}
                        onCheckedChange={toggleTheme}
                      />
                    </div>

                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-zinc-500' : 'text-zinc-600'
                      }`}
                    >
                      Toggle the switch to see the entire page theme change
                      instantly across all components.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>State Preview</CardTitle>
                    <CardDescription>Current store values</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`rounded-lg p-4 ${
                        theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-100'
                      }`}
                    >
                      <pre
                        className={`text-sm ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                        }`}
                      >
                        <code>{JSON.stringify(themeState, null, 2)}</code>
                      </pre>
                    </div>
                    <div className="mt-4 p-4 rounded-lg border-l-4 border-purple-500 bg-purple-500/10">
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                        }`}
                      >
                        Currently viewing in <strong>{themeState.theme}</strong>{' '}
                        mode
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                      Settings persisted in localStorage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg border bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`text-sm ${
                              theme === 'dark'
                                ? 'text-zinc-400'
                                : 'text-zinc-600'
                            }`}
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

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Notifications</Label>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                          }`}
                        >
                          {preferences.notificationsEnabled
                            ? 'Enabled'
                            : 'Disabled'}
                        </p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={preferences.notificationsEnabled}
                        onCheckedChange={toggleNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="space-y-0.5">
                        <Label htmlFor="autosave">Auto-save</Label>
                        <p
                          className={`text-sm ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                          }`}
                        >
                          {preferences.autoSave ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <Switch
                        id="autosave"
                        checked={preferences.autoSave}
                        onCheckedChange={toggleAutoSave}
                      />
                    </div>

                    <Button
                      variant="destructive"
                      onClick={resetPreferences}
                      className="w-full"
                    >
                      Reset Preferences
                    </Button>

                    <p
                      className={`text-xs ${
                        theme === 'dark' ? 'text-zinc-500' : 'text-zinc-600'
                      }`}
                    >
                      💡 Try refreshing the page - your preferences will
                      persist!
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>State Preview</CardTitle>
                    <CardDescription>Current store values</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`rounded-lg p-4 ${
                        theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-100'
                      }`}
                    >
                      <pre
                        className={`text-sm ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                        }`}
                      >
                        <code>{JSON.stringify(preferences, null, 2)}</code>
                      </pre>
                    </div>
                    <div className="mt-4 p-4 rounded-lg border-l-4 border-pink-500 bg-pink-500/10">
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                        }`}
                      >
                        🔒 This store uses <strong>persist: true</strong> to
                        save state across sessions
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
