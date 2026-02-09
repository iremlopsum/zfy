import { Label } from './label'
import { Switch } from './switch'

interface ToggleOptionProps {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: () => void
  theme: 'light' | 'dark'
}

export function ToggleOption({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  theme,
}: ToggleOptionProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border">
      <div className="space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        <p
          className={`text-sm ${
            theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
          }`}
        >
          {description}
        </p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
