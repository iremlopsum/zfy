import { Sparkles } from 'lucide-react'

interface HeroProps {
  theme: 'light' | 'dark'
}

export function Hero({ theme }: HeroProps) {
  return (
    <div className="text-center mb-20">
      <div className="inline-flex items-center gap-2 mb-6">
        <Sparkles
          className={`w-8 h-8 ${
            theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
          }`}
        />
        <h1
          className={`text-6xl tracking-tight text-transparent bg-clip-text ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-400 to-pink-400'
              : 'bg-gradient-to-r from-purple-600 to-pink-600'
          }`}
        >
          zfy
        </h1>
      </div>
      <p
        className={`text-xl max-w-2xl mx-auto mb-4 ${
          theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
        }`}
      >
        Delightful state management built on top of Zustand
      </p>
      <p
        className={`max-w-xl mx-auto ${
          theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
        }`}
      >
        Keep state management as simple as you always loved it to be, with a
        useful set of tools to make that experience even more delightful.
      </p>
    </div>
  )
}
