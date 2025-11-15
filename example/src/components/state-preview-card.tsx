import type { ReactNode } from 'react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from './card'

interface StatePreviewCardProps {
  state: unknown
  theme: 'light' | 'dark'
  infoMessage?: ReactNode
  infoBorderColor?: string
}

export function StatePreviewCard({
  state,
  theme,
  infoMessage,
  infoBorderColor = 'border-purple-500',
}: StatePreviewCardProps) {
  return (
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
            <code>{JSON.stringify(state, null, 2)}</code>
          </pre>
        </div>
        {infoMessage && (
          <div
            className={`mt-4 p-4 rounded-lg border-l-4 ${infoBorderColor} bg-${
              infoBorderColor.split('-')[1]
            }-500/10`}
          >
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
              }`}
            >
              {infoMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
