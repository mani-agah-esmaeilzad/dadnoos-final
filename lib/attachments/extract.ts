import fs from 'node:fs/promises'

import mammoth from 'mammoth'

const MAX_CHARS = 4000

type PdfParseModule = typeof import('pdf-parse')

let pdfModulePromise: Promise<PdfParseModule> | null = null

function clean(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function truncate(text: string, max = MAX_CHARS) {
  if (text.length <= max) return text
  return `${text.slice(0, max)}…`
}

function domMatrixAvailable() {
  return typeof (globalThis as Record<string, unknown>).DOMMatrix !== 'undefined'
}

async function loadPdfModule(): Promise<PdfParseModule | null> {
  if (!domMatrixAvailable()) {
    console.warn('DOMMatrix is unavailable; skipping PDF text extraction.')
    return null
  }
  if (!pdfModulePromise) {
    pdfModulePromise = import('pdf-parse')
  }
  try {
    return await pdfModulePromise
  } catch (error) {
    console.warn('PDF parser unavailable', (error as Error).message)
    return null
  }
}

export async function extractAttachmentSummary(filePath: string, mimeType?: string | null) {
  const mime = (mimeType || '').toLowerCase()
  try {
    if (mime === 'application/pdf') {
      const pdfModule = await loadPdfModule()
      if (!pdfModule?.PDFParse) {
        return null
      }
      const buffer = await fs.readFile(filePath)
      const parser = new pdfModule.PDFParse({ data: buffer })
      try {
        const parsed = await parser.getText()
        const content = clean(parsed.text || '')
        return content ? truncate(content) : null
      } finally {
        await parser.destroy().catch(() => {})
      }
    }
    if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/msword'
    ) {
      const { value } = await mammoth.extractRawText({ path: filePath })
      const content = clean(value || '')
      return content ? truncate(content) : null
    }
    return null
  } catch (error) {
    console.warn('Attachment extraction failed', (error as Error).message)
    return null
  }
}
