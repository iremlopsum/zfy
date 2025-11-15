interface CodeBlockProps {
  code: string
  title: string
  theme: 'light' | 'dark'
}

export function CodeBlock({ title, code, theme }: CodeBlockProps) {
  return (
    <div
      className={`rounded-lg overflow-hidden ${
        theme === 'dark'
          ? 'bg-zinc-900 border border-zinc-800'
          : 'bg-white border border-zinc-200'
      }`}
    >
      <div
        className={`px-4 py-2 border-b ${
          theme === 'dark'
            ? 'bg-zinc-950 border-zinc-800'
            : 'bg-zinc-100 border-zinc-200'
        }`}
      >
        <p
          className={`text-sm ${
            theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
          }`}
        >
          {title}
        </p>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre
          className={`text-sm ${
            theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
          }`}
        >
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}
