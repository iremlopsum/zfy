import { CodeBlock } from '../CodeBlock'

import { storeCode, usageCode } from './demo-code-examples'

interface CodeExamplesViewProps {
  theme: 'light' | 'dark'
}

export function CodeExamplesView({ theme }: CodeExamplesViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CodeBlock title="Store Creation" code={storeCode} theme={theme} />
      <CodeBlock title="Usage Example" code={usageCode} theme={theme} />
    </div>
  )
}
