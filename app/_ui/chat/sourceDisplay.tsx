import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/app/_ui/components/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/app/_ui/components/collapsible'
import { ChevronDown, FileText, Clipboard, Check } from 'lucide-react'
import { toast } from 'sonner'

// Define the interface directly in this file
export interface SourceDocument {
  source: string;
  original_doc_id: string;
  chunk_number: number;
  page_content: string;
}

interface SourceDisplayProps {
  sources: SourceDocument[]
}

export const SourceDisplay: React.FC<SourceDisplayProps> = ({ sources }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      toast.success('متن کپی شد')
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      toast.error('خطا در کپی کردن متن')
    }
  }

  const getFileName = (sourcePath?: string) => {
    if (!sourcePath) {
      return 'Unknown Source'
    }
    const normalized = sourcePath.replace(/\\/g, '/')
    const filename = normalized.split('/').pop() || normalized
    try {
      return decodeURIComponent(filename)
    } catch {
      return filename
    }
  }

  const truncateText = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-auto py-3 text-sm font-medium bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            مشاهده منابع استفاده شده ({sources.length})
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </Button>
      </CollapsibleTrigger>

      <AnimatePresence>
        {isOpen && (
          <CollapsibleContent asChild>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mt-3 space-y-3"
            >
              {sources.map((source, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground mb-1">
                        منبع {index + 1}:
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <FileText className="w-3 h-3" />
                        File: {source.original_doc_id ?? getFileName(source.source)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        شماره بخش: {source.chunk_number}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(source.page_content, index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clipboard className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded p-3 font-inter">
                    <span className="font-medium">بخشی از متن: </span>
                    {truncateText(source.page_content)}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  )
}