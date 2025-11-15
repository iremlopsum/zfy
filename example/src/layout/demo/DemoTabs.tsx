import { UserTab } from './UserTab'
import { ThemeTab } from './ThemeTab'
import { PreferencesTab } from './PreferencesTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs'

import { tabsConfig } from './demo-tabs-config'

import type { TabValue } from '../../hooks/useTabFromUrl'

interface DemoTabsProps {
  theme: 'light' | 'dark'
  selectedTab: TabValue
  onTabChange: (value: TabValue) => void
}

export function DemoTabs({ theme, selectedTab, onTabChange }: DemoTabsProps) {
  return (
    <Tabs
      value={selectedTab}
      onValueChange={(value) => onTabChange(value as TabValue)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 mb-6">
        {tabsConfig.map(({ value, icon: Icon, label }) => (
          <TabsTrigger key={value} value={value} className="gap-2">
            <Icon className="w-4 h-4" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="user" className="space-y-6">
        <UserTab theme={theme} />
      </TabsContent>

      <TabsContent value="theme" className="space-y-6">
        <ThemeTab theme={theme} />
      </TabsContent>

      <TabsContent value="preferences" className="space-y-6">
        <PreferencesTab theme={theme} />
      </TabsContent>
    </Tabs>
  )
}
