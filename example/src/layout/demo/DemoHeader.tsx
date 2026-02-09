import { Code2 } from 'lucide-react'

import { Button } from '../../components/button'

import { getThemeTextClass } from '../../utils/theme-classes'

interface DemoHeaderProps {
  showCode: boolean
  theme: 'light' | 'dark'
  onToggleCode: () => void
}

export function DemoHeader({ theme, onToggleCode }: DemoHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <h2
        className={`text-2xl text-center ${getThemeTextClass(
          theme,
          'text-zinc-200',
          'text-zinc-800'
        )}`}
      >
        Interactive Demo
      </h2>
      <Button variant="outline" size="icon" onClick={onToggleCode}>
        <Code2 />
      </Button>
    </div>
  )
}
