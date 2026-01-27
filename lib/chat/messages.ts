export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }
  | { type: 'file'; url: string; name?: string; mime_type?: string }

export function serializeContent(parts: ContentPart[]): string {
  return JSON.stringify(parts)
}

export function deserializeContent(raw: string): ContentPart[] {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed as ContentPart[]
    }
    return [{ type: 'text', text: String(parsed || '') }]
  } catch (error) {
    return [{ type: 'text', text: raw }]
  }
}

export function partsToPlainText(parts: ContentPart[]): string {
  return parts
    .map((part) => {
      if (part.type === 'text') return part.text
      if (part.type === 'file') return `[پیوست: ${part.name || 'بدون نام'}]`
      if (part.type === 'image_url') return '[تصویر ارسال شد]'
      return ''
    })
    .filter(Boolean)
    .join('\n')
}

export function summarizeParts(parts: ContentPart[]) {
  const textParts: string[] = []
  const imageUrls: string[] = []
  const fileUrls: string[] = []

  parts.forEach((part) => {
    if (part.type === 'text' && part.text) {
      textParts.push(part.text)
    } else if (part.type === 'image_url') {
      imageUrls.push(part.image_url.url)
    } else if (part.type === 'file') {
      fileUrls.push(part.url)
    }
  })

  return {
    content_json: parts,
    text_parts: textParts.length ? textParts : null,
    image_count: imageUrls.length,
    image_urls: imageUrls,
    file_count: fileUrls.length,
    file_urls: fileUrls,
  }
}
