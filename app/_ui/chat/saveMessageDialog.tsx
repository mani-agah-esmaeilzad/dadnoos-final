import { useEffect, useState } from 'react'
import Popup from '@/app/_ui/components/popup'
import { Input } from '@/app/_ui/components/input'
import { Textarea } from '@/app/_ui/components/textarea'
import { Button } from '@/app/_ui/components/button'

interface SaveMessageDialogProps {
  isOpen: boolean
  defaultTitle: string
  defaultCategory?: string
  messageText: string
  onSubmit: (payload: { title: string; category: string }) => void
  onClose: () => void
}

export function SaveMessageDialog({
  isOpen,
  defaultTitle,
  defaultCategory = 'عمومی',
  messageText,
  onSubmit,
  onClose,
}: SaveMessageDialogProps) {
  const [title, setTitle] = useState(defaultTitle)
  const [category, setCategory] = useState(defaultCategory)

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle)
      setCategory(defaultCategory || 'عمومی')
    }
  }, [isOpen, defaultTitle, defaultCategory])

  return (
    <Popup visible={isOpen} onClose={onClose}>
      <div className="space-y-4" dir="rtl">
        <div>
          <h2 className="text-lg font-semibold">ذخیره پیام در پرونده</h2>
          <p className="text-xs text-neutral-500 mt-1">
            عنوان و دسته‌بندی دلخواه را مشخص کنید تا بعداً راحت‌تر پیدا شود.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-neutral-500 mb-1.5">عنوان پرونده</p>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1.5">دسته‌بندی</p>
            <Input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="مثل: دعاوی خانواده، قراردادها، کیفری"
            />
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1.5">چکیده پیام</p>
            <Textarea
              value={messageText}
              readOnly
              className="text-xs h-32 bg-neutral-100 dark:bg-neutral-900/50"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button
            onClick={() => {
              onSubmit({
                title: title.trim() || defaultTitle,
                category: category.trim() || 'عمومی',
              })
            }}
          >
            ذخیره در فایل‌منیجر
          </Button>
        </div>
      </div>
    </Popup>
  )
}
