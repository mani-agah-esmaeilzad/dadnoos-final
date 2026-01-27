import { useEffect, useMemo, useState } from 'react'
import { Download, FileText, Trash2 } from 'lucide-react'
import Popup from '@/app/_ui/components/popup'
import { Button } from '@/app/_ui/components/button'
import { Input } from '@/app/_ui/components/input'
import { SavedMessageFile, useSavedMessagesStore } from '@/app/_lib/hooks/useSavedMessages'
import { saveAs } from 'file-saver'
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Header,
  Footer,
  ImageRun,
} from 'docx'

interface SavedMessagesManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function SavedMessagesManager({ isOpen, onClose }: SavedMessagesManagerProps) {
  const files = useSavedMessagesStore((state) => state.files)
  const removeFile = useSavedMessagesStore((state) => state.removeFile)
  const renameFile = useSavedMessagesStore((state) => state.renameFile)
  const updateCategory = useSavedMessagesStore((state) => state.updateCategory)

  const [titleDrafts, setTitleDrafts] = useState<Record<string, string>>({})
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, string>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('همه')

  useEffect(() => {
    if (!isOpen) return

    const drafts: Record<string, string> = {}
    files.forEach((file) => {
      drafts[file.id] = file.title
    })
    setTitleDrafts(drafts)

    const categoryDraftMap: Record<string, string> = {}
    files.forEach((file) => {
      categoryDraftMap[file.id] = file.category || 'عمومی'
    })
    setCategoryDrafts(categoryDraftMap)
  }, [files, isOpen])

  const handleRename = (id: string) => {
    const next = titleDrafts[id]
    renameFile(id, next || '')
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'long',
    })
  }

  const downloadAsWord = async (fileId: string) => {
    const file = files.find((f) => f.id === fileId)
    if (!file) return

    const doc = await createBrandedDocument(file)
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${file.title || 'پیام ذخیره‌شده'}.docx`)
  }

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(files.map((file) => file.category || 'عمومی'))
    )
    unique.sort((a, b) => a.localeCompare(b, 'fa'))
    return ['همه', ...unique]
  }, [files])

  const filteredFiles = useMemo(() => {
    if (selectedCategory === 'همه') return files
    return files.filter((file) => (file.category || 'عمومی') === selectedCategory)
  }, [files, selectedCategory])

  const emptyState = useMemo(
    () => files.length === 0,
    [files.length],
  )

  return (
    <Popup visible={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4" dir="rtl">
        <div className="flex items-center justify-between border-b pb-3 mb-1">
          <div>
            <p className="text-lg font-semibold">فایل‌های ذخیره‌شده</p>
            <p className="text-xs text-neutral-500">
              پیام‌های AI را به فرمت Word دانلود کنید.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            بستن
          </Button>
        </div>

        {emptyState ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-600 px-6 py-10 text-center text-sm text-neutral-500">
            هنوز پیامی ذخیره نشده است. روی آیکون ذخیره پیام هوش مصنوعی بزنید تا در اینجا ببینید.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === selectedCategory ? 'secondary' : 'ghost'}
                  className="px-3 py-1 rounded-2xl text-xs"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'همه' ? 'همه پرونده‌ها' : category}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="rounded-3xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-900/50 p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-3 shadow-sm">
                    <FileText className="size-5 text-[#9b956d]" />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={titleDrafts[file.id] ?? file.title}
                      onChange={(event) =>
                        setTitleDrafts((prev) => ({
                          ...prev,
                          [file.id]: event.target.value,
                        }))
                      }
                      onBlur={() => handleRename(file.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.currentTarget.blur()
                        }
                      }}
                      className="text-sm font-semibold bg-transparent focus-visible:ring-neutral-400"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {formatDate(file.savedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    value={categoryDrafts[file.id] ?? file.category}
                    onChange={(event) =>
                      setCategoryDrafts((prev) => ({
                        ...prev,
                        [file.id]: event.target.value,
                      }))
                    }
                    onBlur={() => updateCategory(file.id, categoryDrafts[file.id] ?? file.category)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.currentTarget.blur()
                      }
                    }}
                    className="text-xs font-medium bg-transparent focus-visible:ring-neutral-400"
                    placeholder="دسته‌بندی"
                  />
                  <span className="text-[11px] px-2 py-1 rounded-full bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-200">
                    {(file.category || 'عمومی')}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line max-h-32 overflow-hidden">
                  {file.content}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 px-3 text-xs"
                    onClick={() => downloadAsWord(file.id)}
                  >
                    <Download className="size-4" />
                    دانلود Word
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-neutral-500 hover:text-red-500"
                    onClick={() => removeFile(file.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Popup>
  )
}

async function loadLogoImage(): Promise<Uint8Array | null> {
  try {
    const res = await fetch('/logo.png')
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    return new Uint8Array(buffer)
  } catch (error) {
    console.error('Failed to load logo for docx export:', error)
    return null
  }
}

async function createBrandedDocument(file: SavedMessageFile) {
  const paragraphs = textToParagraphs(file.content)
  const logoImage = await loadLogoImage()

  const headerChildren = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 },
      children: [
        logoImage
          ? new ImageRun({
            data: logoImage,
            type: 'png',
            transformation: {
              width: 80,
              height: 80,
            },
          })
          : new TextRun({
            text: 'Dadnoos',
            bold: true,
            size: 26,
            color: '3C2F23',
            rightToLeft: true,
          }),
      ],
    }),
  ]

  const infoParagraphs = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: file.title || 'بدون عنوان',
          bold: true,
          size: 32,
          color: '1F1F1F',
          rightToLeft: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `دسته‌بندی: ${file.category || 'عمومی'}`,
          size: 24,
          color: '4B4B4B',
          rightToLeft: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 320 },
      children: [
        new TextRun({
          text: `تاریخ ذخیره‌سازی: ${formatFaDate(file.savedAt)}`,
          size: 22,
          color: '6B6B6B',
          rightToLeft: true,
        }),
      ],
    }),
  ]

  return new DocxDocument({
    title: file.title,
    creator: 'Dadnoos AI',
    sections: [
      {
        headers: {
          default: new Header({
            children: headerChildren,
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'ساخته شده توسط سامانه حقوقی دادنوس',
                    size: 20,
                    color: '888888',
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
        },
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              left: 720,
              bottom: 720,
            },
          },
        },
        children: [...infoParagraphs, ...paragraphs],
      },
    ],
  })
}

function formatFaDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function textToParagraphs(text: string) {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  if (blocks.length === 0) {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: text || '',
            rightToLeft: true,
          }),
        ],
        bidirectional: true,
        alignment: AlignmentType.RIGHT,
        spacing: { after: 120 },
      }),
    ]
  }

  return blocks.map(
    (block) =>
      new Paragraph({
        children: block.split('\n').map((line, index) => {
          if (index === 0)
            return new TextRun({
              text: line,
              rightToLeft: true,
            })
          return new TextRun({
            text: line,
            break: 1,
            rightToLeft: true,
          })
        }),
        bidirectional: true,
        alignment: AlignmentType.RIGHT,
        spacing: { after: 120 },
      }),
  )
}
