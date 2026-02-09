import { Loader2 } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 transition-colors duration-300">
      <div className="flex flex-col items-center gap-6 max-w-md px-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-20">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          </div>
          <Loader2 className="w-16 h-16 animate-spin text-purple-500" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Loading Your Preferences
          </h2>
          <p className="text-zinc-400 text-sm">
            Rehydrating your persisted state...
          </p>
        </div>

        <div className="w-full max-w-xs bg-zinc-900 rounded-full h-1 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
