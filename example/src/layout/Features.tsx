import { Check } from 'lucide-react'

const features = [
  'Fully typed with TypeScript',
  'Standardized access/update API backed by Immer',
  'Ability to manage & consume multiple stores at once',
  'Simple API for store creation with custom middlewares',
  'Out-of-the-box persist gate component & rehydration hook',
  'Logger, persist & subscribe middlewares available via a simple flag',
]

interface FeaturesProps {
  theme: 'light' | 'dark'
}

export function Features({ theme }: FeaturesProps) {
  return (
    <div className="mb-20">
      <h2
        className={`text-2xl mb-8 text-center ${
          theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'
        }`}
      >
        Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-4 rounded-lg ${
              theme === 'dark'
                ? 'bg-zinc-900 border border-zinc-800'
                : 'bg-white border border-zinc-200'
            }`}
          >
            <Check
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}
            />
            <span
              className={theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}
            >
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
