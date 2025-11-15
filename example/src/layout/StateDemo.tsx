import { useState } from 'react'

import { DemoTabs } from './demo/DemoTabs'
import { DemoHeader } from './demo/DemoHeader'
import { CodeExamplesView } from './demo/CodeExamplesView'

import { useTabFromUrl } from '../hooks/useTabFromUrl'

interface StateDemoProps {
  theme: 'light' | 'dark'
}

export function StateDemo({ theme }: StateDemoProps) {
  const [showCode, setShowCode] = useState(false)
  const [selectedTab, setSelectedTab] = useTabFromUrl()

  return (
    <div className="mb-20">
      <DemoHeader
        theme={theme}
        showCode={showCode}
        onToggleCode={() => setShowCode(!showCode)}
      />

      <div className="max-w-5xl mx-auto">
        {showCode ? (
          <CodeExamplesView theme={theme} />
        ) : (
          <DemoTabs
            theme={theme}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
          />
        )}
      </div>
    </div>
  )
}
