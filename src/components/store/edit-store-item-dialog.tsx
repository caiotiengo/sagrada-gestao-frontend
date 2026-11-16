'use client'

import { useState } from 'react'
import { useUpdateStoreItem } from '@/hooks/use-store'
import { useAuthStore } from '@/stores/auth'
import type { StoreItem, UpdateStoreItemRequest } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { CurrencyInput } from '@/components/forms/currency-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const NAME_MIN = 2
const NAME_MAX = 120
const DESCRIPTION_MAX = 1000

function imageUrlError(url: string): string | null {
  const v = url.trim()
  if (!v) return null
  if (!/^https:\/\//i.test(v)) return 'A URL da imagem deve começar com https://'
  try {
    new URL(v)
  } catch {
    return 'URL inválida'
  }
  if (v.length > 500) return 'URL deve ter no máximo 500 caracteres'
  return null
}

function nameError(name: string): string | null {
  const v = name.trim()
  if (v.length < NAME_MIN) return `O nome precisa de pelo menos ${NAME_MIN} caracteres`
  if (v.length > NAME_MAX) return `O nome pode ter até ${NAME_MAX} caracteres`
  if (/[<>]/.test(v)) return 'O nome não pode ter os caracteres < ou >'
  return null
}

/** Edição de nome, preço, descrição, imagem (https) e ativo. Estoque segue no "Ajustar estoque". */
export function EditStoreItemDialog({ item, onClose }: { item: StoreItem | null; onClose: () => void }) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        {item && <EditForm key={item.id} item={item} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function EditForm({ item, onClose }: { item: StoreItem; onClose: () => void }) {
  const houseId = useAuthStore((s) => s.currentHouseId())
  const update = useUpdateStoreItem()
  const [name, setName] = useState(item.name)
  const [price, setPrice] = useState(item.price)
  const [description, setDescription] = useState(item.description ?? '')
  const [imageUrl, setImageUrl] = useState(item.imageUrl ?? '')
  const [isActive, setIsActive] = useState(item.isActive)

  const errName = nameError(name)
  const errImage = imageUrlError(imageUrl)
  const errDescription = description.length > DESCRIPTION_MAX ? `Descrição deve ter no máximo ${DESCRIPTION_MAX} caracteres` : null
  const invalid = !!errName || !!errImage || !!errDescription || !price

  const handleSave = () => {
    if (!houseId || invalid) return
    const data: UpdateStoreItemRequest = { houseId, itemId: item.id }
    if (name.trim() !== item.name) data.name = name.trim()
    if (Math.round(price * 100) !== Math.round(item.price * 100)) data.price = price
    if (description.trim() !== (item.description ?? '')) data.description = description.trim()
    // '' remove a imagem no back.
    if (imageUrl.trim() !== (item.imageUrl ?? '')) data.imageUrl = imageUrl.trim()
    if (isActive !== item.isActive) data.isActive = isActive
    if (Object.keys(data).length === 2) {
      onClose()
      return
    }
    update.mutate(data, { onSuccess: onClose })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar item</DialogTitle>
        <DialogDescription>O estoque é alterado em &quot;Ajustar estoque&quot;.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <label htmlFor="edit-item-name" className="text-sm font-medium">Nome *</label>
          <Input id="edit-item-name" value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} />
          {errName && <p className="text-xs text-destructive">{errName}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="edit-item-price" className="text-sm font-medium">Preço *</label>
          <CurrencyInput id="edit-item-price" value={price} onValueChange={setPrice} />
          {!price && <p className="text-xs text-destructive">Informe o preço</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="edit-item-description" className="text-sm font-medium">Descrição</label>
          <Textarea
            id="edit-item-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errDescription && <p className="text-xs text-destructive">{errDescription}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="edit-item-image" className="text-sm font-medium">URL da imagem</label>
          <Input
            id="edit-item-image"
            type="url"
            inputMode="url"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            aria-invalid={!!errImage}
          />
          {errImage ? (
            <p className="text-xs text-destructive">{errImage}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Em branco remove a imagem.</p>
          )}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          {isActive ? 'Ativo (aparece para venda)' : 'Inativo (não aparece para venda)'}
        </label>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={invalid || update.isPending}>
          {update.isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogFooter>
    </>
  )
}
