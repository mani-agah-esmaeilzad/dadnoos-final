import { useRef, useState } from 'react'
import { Camera, FileUp, ImageUp } from 'lucide-react'
import { Button } from '@/app/_ui/components/button'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/app/_lib/utils'

import CircleLoader from '@/app/_ui/components/circleLoader'

interface UploadPanelProps {
  isOpen: boolean
  onClose: () => void
  onContractUpload: (file: File, type: 'contract' | 'document') => Promise<void> | void
  onStartChatWithPrompt: (prompt: string | string[], analysisResult?: any) => void
}

export function UploadPanel({
  isOpen,
  onClose,
  onContractUpload,
  onStartChatWithPrompt
}: UploadPanelProps) {
  const [analysisType, setAnalysisType] = useState<'contract' | 'document'>('contract')
  const [expanded, setExpanded] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)

  const defaultGallery = Array.from({ length: 30 }, (_, i) => `https://picsum.photos/id/${0 + i}/600/600`)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (event.target) event.target.value = ''
    if (file) handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    onClose()
    try {
      await onContractUpload(file, analysisType)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "یک خطای ناشناخته رخ داده است"
      onStartChatWithPrompt(`متاسفانه در تحلیل ${analysisType === 'contract' ? 'قرارداد' : 'سند'} "${file.name}" مشکلی پیش آمد.\n\n**خطا:** ${errorMessage}`)
    }
  }

  const handleUploadFromGallery = async (url: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const file = new File([blob], `image-${Date.now()}.jpg`, { type: blob.type })
      handleUpload(file)
    } catch (error) {
      onStartChatWithPrompt(`خطا در بارگذاری عکس از گالری: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && (
        <motion.div
          className="fixed inset-0 h-screen z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <CircleLoader />
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed inset-0 z-[9997] flex items-end justify-center">
            {/* Background Overlay */}
            <motion.div
              className="absolute inset-0 bg-black z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: expanded ? .75 : .9, transition: { duration: .3 } }}
              exit={{ opacity: 0 }}
              transition={{ duration: .4 }}
              onClick={onClose}
            />

            {/* Panel */}
            <motion.div
              className="relative w-full h-screen max-w-3xl bg-white dark:bg-[#303030] rounded-t-4xl pt-8 px-5 pb-24 grid z-[9999]"
              initial={{ y: "100%" }}
              animate={{ y: expanded ? 625 : 220 }}
              exit={{ y: "100%", transition: { duration: 0.2, type: 'tween' } }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 30
              }}
              drag="y"
              dragElastic={.15}
              dragConstraints={expanded ? { top: 625, bottom: 625 } : { top: 220, bottom: 220 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 50) {
                  setExpanded(true)
                } else if (info.offset.y < -50) {
                  setExpanded(false)
                } else {
                  setExpanded(false)
                }
              }}
            >
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key="handle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-1.5 left-1/2 -translate-x-1/2 h-1.5 w-[10%] rounded-full bg-neutral-400/25 hover:bg-neutral-400/75 active:bg-neutral-400/75 transition-colors cursor-pointer"
                    onClick={() => setExpanded(!expanded)}
                  />
                )}
              </AnimatePresence>

              <div className='grid grid-cols-3 gap-x-5 mb-5'>
                {/* فایل */}
                <Button variant="secondary" className="w-full aspect-4/3 rounded-3xl justify-start p-3 h-auto" onClick={() => fileInputRef.current?.click()}>
                  <div className="flex flex-col items-center mx-auto gap-3">
                    <FileUp className="size-8" />
                    <h3 className="text-sm">فایل</h3>
                  </div>
                </Button>

                {/* عکس از گالری */}
                <Button variant="secondary" className="w-full aspect-4/3 rounded-3xl justify-start p-3 h-auto" onClick={() => imageInputRef.current?.click()}>
                  <div className="flex flex-col items-center mx-auto gap-3">
                    <ImageUp className="size-8" />
                    <h3 className="text-sm">عکس</h3>
                  </div>
                </Button>

                {/* دوربین */}
                <Button variant="secondary" className="w-full aspect-4/3 rounded-3xl justify-start p-3 h-auto" onClick={() => cameraInputRef.current?.click()}>
                  <div className="flex flex-col items-center mx-auto gap-3">
                    <Camera className="size-8" />
                    <h3 className="text-sm">دوربین</h3>
                  </div>
                </Button>
              </div>


              <div
                className={cn(
                  expanded ? "opacity-0" : "opacity-100",
                  "w-full h-3/4 mt-1.5 overflow-y-auto transition-all duration-400 rounded-3xl overscroll-none"
                )}
              >
                <div className='grid grid-cols-3 gap-1 z-30'>
                  {defaultGallery.map((src, index) => (
                    <div className='w-full aspect-square' key={index}>
                      <img
                        key={index}
                        // width={500}
                        // height={500}
                        src={src}
                        className="w-full h-auto object-cover shadow-sm hover:scale-95 active:scale-95 active:shadow-2xl transition-all cursor-pointer"
                        alt={`Gallery image ${index + 1}`}
                        onClick={() => handleUploadFromGallery(src)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* hidden inputs */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,.txt,.zip,.rar,image/*"
                className='hidden'
                onChange={handleFileSelect}
              />
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                className='hidden'
                onChange={handleFileSelect}
              />
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                className='hidden'
                onChange={handleFileSelect}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}