export const getThemeTextClass = (
  theme: 'light' | 'dark',
  darkClass = 'text-zinc-300',
  lightClass = 'text-zinc-700'
) => (theme === 'dark' ? darkClass : lightClass)

export const getThemeBgClass = (
  theme: 'light' | 'dark',
  darkClass = 'bg-zinc-950',
  lightClass = 'bg-zinc-100'
) => (theme === 'dark' ? darkClass : lightClass)

