import { Github, Heart } from 'lucide-react'

interface FooterProps {
  theme: 'light' | 'dark'
}

export function Footer({ theme }: FooterProps) {
  return (
    <footer
      className={`text-center pt-12 pb-6 border-t ${
        theme === 'dark' ? 'border-zinc-900' : 'border-zinc-200'
      }`}
    >
      <div
        className={`flex items-center justify-center gap-2 mb-4 ${
          theme === 'dark' ? 'text-zinc-500' : 'text-zinc-600'
        }`}
      >
        <span>Built with</span>
        <Heart
          className={`w-4 h-4 fill-current ${
            theme === 'dark' ? 'text-pink-400' : 'text-pink-600'
          }`}
        />
        <span>on top of Zustand</span>
      </div>
      <div className="flex items-center justify-center gap-6">
        <a
          href="https://github.com/colorfy-software/zfy"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 transition-colors ${
            theme === 'dark'
              ? 'text-zinc-400 hover:text-purple-400'
              : 'text-zinc-600 hover:text-purple-600'
          }`}
        >
          <Github className="w-5 h-5" />
          <span>GitHub</span>
        </a>
        <a
          href="https://colorfy-software.gitbook.io/zfy"
          target="_blank"
          rel="noopener noreferrer"
          className={`transition-colors ${
            theme === 'dark'
              ? 'text-zinc-400 hover:text-purple-400'
              : 'text-zinc-600 hover:text-purple-600'
          }`}
        >
          Documentation
        </a>
        <a
          href="https://www.npmjs.com/package/@colorfy-software/zfy"
          target="_blank"
          rel="noopener noreferrer"
          className={`transition-colors ${
            theme === 'dark'
              ? 'text-zinc-400 hover:text-purple-400'
              : 'text-zinc-600 hover:text-purple-600'
          }`}
        >
          npm Package
        </a>
      </div>
    </footer>
  )
}
