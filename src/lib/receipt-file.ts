import type { ReceiptContentType } from '@/types/receipts'

/** Limite do back (depois de decodificado). */
export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024
/** Acima disto (ou do lado máximo) a imagem é recomprimida no navegador. */
const COMPRESS_ABOVE_BYTES = 1.5 * 1024 * 1024
const MAX_SIDE = 2000
const JPEG_QUALITY = 0.8

export const RECEIPT_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf'

export interface PreparedReceiptFile {
  base64: string
  contentType: ReceiptContentType
  size: number
  fileName: string
  compressed: boolean
}

export class ReceiptFileError extends Error {}

const DIRECT_TYPES: ReceiptContentType[] = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

function guessType(file: File): string {
  if (file.type) return file.type
  const ext = file.name.toLowerCase().split('.').pop()
  if (ext === 'pdf') return 'application/pdf'
  if (ext === 'png') return 'image/png'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'heic' || ext === 'heif') return 'image/heic'
  return ''
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(new ReceiptFileError('Não foi possível ler o arquivo.'))
    reader.readAsDataURL(blob)
  })
}

async function decodeImage(file: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file)
  } catch {
    throw new ReceiptFileError('Não foi possível abrir esta imagem. Envie um print (PNG/JPG) ou o PDF do banco.')
  }
}

async function toJpeg(bitmap: ImageBitmap): Promise<Blob> {
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ReceiptFileError('Seu navegador não conseguiu preparar a imagem.')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(bitmap, 0, 0, w, h)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
  if (!blob) throw new ReceiptFileError('Seu navegador não conseguiu preparar a imagem.')
  return blob
}

/**
 * Prepara o arquivo para o envio. Imagem pequena vai COMO ESTÁ (os bytes
 * originais importam para a leitura); só recomprime em JPEG quando passa de
 * 1,5 MB ou de 2000 px no lado maior, ou quando o formato não é aceito pelo
 * servidor (HEIC do iPhone). PDF vai sem mexer.
 */
export async function prepareReceiptFile(file: File): Promise<PreparedReceiptFile> {
  const type = guessType(file)
  const isPdf = type === 'application/pdf'
  const isImage = type.startsWith('image/')
  if (!isPdf && !isImage) {
    throw new ReceiptFileError('Envie uma foto, um print (JPG, PNG, WEBP) ou o PDF do comprovante.')
  }

  if (isPdf) {
    if (file.size > RECEIPT_MAX_BYTES) throw new ReceiptFileError('PDF maior que 5 MB. Envie um print da tela do banco.')
    return { base64: await blobToBase64(file), contentType: 'application/pdf', size: file.size, fileName: file.name, compressed: false }
  }

  const accepted = DIRECT_TYPES.includes(type as ReceiptContentType)
  let needsCompress = !accepted || file.size > COMPRESS_ABOVE_BYTES
  let bitmap: ImageBitmap | null = null
  if (!needsCompress) {
    // Lado grande também recomprime (foto de câmera de 4000 px).
    try {
      bitmap = await createImageBitmap(file)
      if (Math.max(bitmap.width, bitmap.height) > MAX_SIDE) needsCompress = true
    } catch {
      // Não deu para medir: manda como está e o servidor confere.
    }
  }

  if (!needsCompress) {
    bitmap?.close()
    return { base64: await blobToBase64(file), contentType: type as ReceiptContentType, size: file.size, fileName: file.name, compressed: false }
  }

  bitmap = bitmap ?? (await decodeImage(file))
  const jpeg = await toJpeg(bitmap)
  bitmap.close()
  if (jpeg.size > RECEIPT_MAX_BYTES) throw new ReceiptFileError('A imagem continua maior que 5 MB. Envie um print da tela.')
  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return { base64: await blobToBase64(jpeg), contentType: 'image/jpeg', size: jpeg.size, fileName: name, compressed: true }
}
