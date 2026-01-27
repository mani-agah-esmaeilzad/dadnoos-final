import { HttpError } from '@/lib/http/errors'

export function enforceBodySizeLimit(req: Request, maxBytes: number) {
  const lengthHeader = req.headers.get('content-length')
  if (!lengthHeader) return
  const length = Number(lengthHeader)
  if (!Number.isNaN(length) && length > maxBytes) {
    throw new HttpError(413, `Payload too large (>${maxBytes} bytes).`)
  }
}
