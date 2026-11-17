'use client'

import type { ExtraPermission } from '@/types'
import { PERMISSIONS, PERMISSION_PRESETS, applyPreset, presetIsOn } from '@/constants'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface PermissionsEditorProps {
  value: ExtraPermission[]
  onChange: (next: ExtraPermission[]) => void
  disabled?: boolean
  idPrefix?: string
}

/**
 * Caixas de permissão com uma linha explicando cada uma e atalhos prontos
 * (Tesouraria, Cantina…). Atalho só marca as caixas; clicar de novo num atalho
 * já todo marcado desmarca as dele. Nada é salvo aqui: quem usa decide quando.
 */
export function PermissionsEditor({ value, onChange, disabled, idPrefix = 'perm' }: PermissionsEditorProps) {
  const toggle = (key: ExtraPermission) => {
    onChange(value.includes(key) ? value.filter((p) => p !== key) : PERMISSIONS.map((p) => p.key).filter((k) => k === key || value.includes(k)))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Atalhos</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Atalhos de permissões">
          {PERMISSION_PRESETS.map((preset) => {
            const on = presetIsOn(value, preset)
            return (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                aria-pressed={on}
                onClick={() =>
                  onChange(on ? value.filter((p) => !preset.permissions.includes(p)) : applyPreset(value, preset))
                }
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                  on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-muted',
                )}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-1">
        {PERMISSIONS.map((perm) => {
          const id = `${idPrefix}-${perm.key}`
          return (
            <label
              key={perm.key}
              htmlFor={id}
              className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-muted"
            >
              <Checkbox
                id={id}
                className="mt-0.5"
                checked={value.includes(perm.key)}
                disabled={disabled}
                onCheckedChange={() => toggle(perm.key)}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{perm.label}</span>
                <span className="block text-xs text-muted-foreground">{perm.description}</span>
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
