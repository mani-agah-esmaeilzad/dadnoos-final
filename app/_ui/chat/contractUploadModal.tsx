import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/_ui/components/dialog'
import { Button } from '@/app/_ui/components/button'
import { Progress } from '@/app/_ui/components/progress'

import { UploadCloud, File, X } from 'lucide-react'
import { cn } from '@/app/_lib/utils'

interface ContractUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => void | Promise<void>
  title?: string
  description?: string
}

export function ContractUploadModal({
  isOpen,
  onClose,
  onUpload,
  title = "آپلود قرارداد",
  description = "قرارداد خود را برای تحلیل حقوقی و شناسایی ریسک‌ها آپلود کنید."
}: ContractUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)
    if (rejectedFiles?.length > 0) {
      setError('فایل معتبر نیست. لطفا فایل PDF یا DOCX با حجم کمتر از 5 مگابایت انتخاب کنید.')
      return
    }
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': []
    },
    maxSize: 5 * 1024 * 1024,
  })

  const handleUpload = () => {
    if (!file) return

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 200)

    setTimeout(() => {
      onUpload(file)
      setUploadProgress(100)
      setTimeout(() => handleClose(), 500)
    }, 4000)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
    setUploadProgress(0)
  }

  const handleClose = () => {
    setFile(null)
    setError(null)
    setUploadProgress(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] pt-8 pb-0 px-2">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-6 px-2">
          {!file ? (
            <div
              {...getRootProps()}
              className={cn(
                "p-10 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-colors duration-200 ease-in-out",
                isDragActive ? 'border-blue-400/25 bg-blue-400/50' : 'border-neutral-400/25'
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-4 text-neutral-400">
                <UploadCloud className="size-12" />
                {isDragActive ? (
                  <p>فایل را اینجا رها کنید...</p>
                ) : (
                  <p>فایل را بکشید و اینجا رها کنید، یا برای انتخاب کلیک کنید</p>
                )}
                <p className="text-xs">PDF, DOCX, JPG, PNG (حداکثر 5 مگابایت)</p>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-neutral-400/25 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File className="w-6 h-6 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs">
                      {(file.size / 1024 / 1024).toFixed(2)} مگابایت
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={handleRemoveFile}>
                  <X className="size-4" />
                </Button>
              </div>
              {uploadProgress > 0 && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-center mt-1">{uploadProgress}%</p>
                </div>
              )}
            </div>
          )}
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>

        <DialogFooter className='grid md:grid-cols-2 gap-y-2 px-2'>
          <Button className='md:order-last rounded-full' onClick={handleUpload} disabled={!file || uploadProgress > 0}>
            {uploadProgress > 0 ? 'در حال آپلود...' : 'آپلود و تحلیل'}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            className='rounded-full'
          >
            لغو
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
