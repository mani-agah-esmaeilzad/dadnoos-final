import React, { useRef, useEffect, useState } from 'react'

import { AnimatePresence, motion } from "framer-motion"

import { Message } from '@/app/_ui/chat/message'
import { UploadPanel } from '@/app/_ui/chat/uploadDoc'
import MeteorShower from '@/app/_ui/chat/animationForNoMessage'
import { TypingIndicator } from '@/app/_ui/chat/typingIndicator'

import { cn } from '@/app/_lib/utils'

import PricingButton from '@/app/_ui/pricing/pricing-button'
import type { QueuedPrompt } from '@/app/_lib/hooks/useChat'
import ChatInput from '@/app/_ui/chat/chatInputBar'
import { ArrowDown } from 'lucide-react'
import { useSavedMessagesStore } from '@/app/_lib/hooks/useSavedMessages'
import { SavedMessagesManager } from '@/app/_ui/chat/savedMessagesManager'
import { SaveMessageDialog } from '@/app/_ui/chat/saveMessageDialog'

const defaultSuggestions = [
  'چگونه می‌توان ادعای خسارت ناشی از قرارداد را مطرح کرد؟',
  'حقوق مستاجر و موجر در قرارداد اجاره چگونه است؟',
  'چگونه می‌توان شکایت کلاهبرداری تنظیم کرد؟',
  'روش اعتراض به رأی دادگاه چیست؟',
]

export type UploadedFile = {
  id: string
  file?: File
  fileName: string
  fileSize: number
  type: 'contract' | 'document'
}

interface MessageType {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  isHistory?: boolean
}

interface ChatInterfaceProps {
  collapsed: boolean
  inputValue: string
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  suggestions: string[]
  messages: MessageType[]
  isThinking: boolean
  setIsThinking: React.Dispatch<React.SetStateAction<boolean>>
  useIsMobile: () => boolean
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  onSuggestionClick: (suggestion: string) => void
  onUpdateMessageContent: (messageId: string, newContent: string) => void
  queuedPrompts: QueuedPrompt[]
  onRemoveQueuedPrompt: (promptId: string) => void
  onContractUpload: (file: File, type: 'contract' | 'document') => Promise<void> | void
  onStartChatWithPrompt: any
  retryAIMessage?: (messageId: string) => void
  uploadedFiles?: any
  removeUploadedFile?: (id: string) => void
  shouldResetAudio?: boolean
  setShouldResetAudio?: any
  errorMessage?: any
  chatContainerRef: any
  isFileManagerOpen: boolean
  onOpenFileManager: () => void
  onCloseFileManager: () => void
}

export default function ChatInterface({
  useIsMobile,
  inputValue,
  collapsed,
  onInputChange,
  errorMessage,
  onSendMessage,
  messages,
  isThinking,
  uploadedFiles,
  removeUploadedFile,
  retryAIMessage,
  onSuggestionClick,
  onUpdateMessageContent,
  queuedPrompts,
  onRemoveQueuedPrompt,
  onContractUpload,
  shouldResetAudio,
  setShouldResetAudio,
  chatContainerRef,
  onStartChatWithPrompt,
  isFileManagerOpen,
  onOpenFileManager,
  onCloseFileManager
}: ChatInterfaceProps) {
  const isMobile = useIsMobile()
  const [fontSize, setFontSize] = useState(15)
  const [isTyping, setIsTyping] = useState(false)
  const [promptHeight, setPromptHeight] = useState(0)
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [messageToSave, setMessageToSave] = useState<MessageType | null>(null)
  const [defaultSaveTitle, setDefaultSaveTitle] = useState('')
  const [defaultCaseId, setDefaultCaseId] = useState<string | undefined>(undefined)

  const hasQueuedPrompts = queuedPrompts.length > 0

  const lastDistance = useRef<number | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const promptContainerRef = useRef<HTMLDivElement>(null)
  const addSavedFile = useSavedMessagesStore((state) => state.addFile)

  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight

      setShowScrollButton(distanceFromBottom > 250)
    }

    container.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [messages])

  useEffect(() => {
    if (promptContainerRef.current) {
      setPromptHeight(promptContainerRef.current.offsetHeight)
    }
  }, [queuedPrompts, promptContainerRef, messages])

  useEffect(() => {
    if (!messagesContainerRef.current || messages.length === 0) return

    const container = messagesContainerRef.current
    const lastUserMessage = [...messages].reverse().find(msg => msg.isUser)
    if (!lastUserMessage) return

    const lastMessageEl = document.getElementById(`message-${lastUserMessage.id}`)
    if (!lastMessageEl) return

    const contentHeight = container.scrollHeight
    const containerHeight = container.clientHeight

    const promptExtra = promptHeight

    const extraPadding = Math.max(containerHeight - contentHeight + promptExtra, promptExtra)

    container.style.paddingBottom = `${extraPadding + 100}px`

    lastMessageEl.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [messages, promptHeight])

  // Handle zoom (wheel + pinch)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        setFontSize(s => Math.max(10, Math.min(30, s - e.deltaY * 0.02)))
      }
    }

    let isTwoFingerTouch = false

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        isTwoFingerTouch = true
        document.body.style.overflowY = "hidden"

        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )

        if (lastDistance.current) {
          const delta = dist - lastDistance.current
          setFontSize(s => Math.max(14, Math.min(26, s + delta * 0.05)))
        }
        lastDistance.current = dist
      }
    }

    const handleTouchEnd = () => {
      lastDistance.current = null
      if (isTwoFingerTouch) {
        document.body.style.overflowY = "auto"
        isTwoFingerTouch = false
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchcancel', handleTouchEnd)
      document.body.style.overflowY = "auto"
    }
  }, [])

  const handleSaveAiMessage = (message: MessageType) => {
    if (!message.text?.trim() || message.isUser) return

    const formattedDate = new Date().toLocaleString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    })

    const defaultTitle = `پیام ذخیره‌شده ${formattedDate}`
    setDefaultSaveTitle(defaultTitle)
    setMessageToSave(message)
    setIsSaveDialogOpen(true)
  }

  return (
    <>
      <div className="overflow-x-hidden w-screen mt-safe">
        <div className={cn(
          "flex flex-col h-full transition-all duration-200 dark:bg-black md:dark:bg-[#202020] tracking-normal",
          !collapsed && isMobile && "-translate-x-[85%]"
        )}>

          {messages.length === 0 &&
            <div className='hidden md:flex w-fit mx-auto items-center justify-center h-12'>
              <PricingButton />
            </div>
          }

          {/* Chat Messages Area */}
          <div ref={chatContainerRef} className="relative flex-1 overflow-y-auto overflow-x-hidden scrollbar scrollbar-chat z-0 px-2 mt-12 md:mt-0">
            <div className="flex flex-col">
              <div
                ref={messagesContainerRef}
                className="space-y-2 md:space-y-4 flex flex-col w-full max-w-4xl mx-auto md:mt-10"
              >
                {messages.map((message, index) => {
                  const isLast = index === messages.length - 1

                  return (
                    <motion.div
                      key={message.id}
                      id={`message-${message.id}`}
                      initial={{
                        opacity: message.isHistory ? 0 : 0,
                        y: message.isUser && !message.isHistory ? 20 : 0
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      transition={{
                        duration: message.isHistory ? 0.4 : 0.2,
                        delay: message.isHistory ? .25 : 0,
                        ease: "easeOut",
                      }}
                    >
                      <Message
                        isLast={isLast}
                        message={message}
                        isTyping={isTyping}
                        fontSize={fontSize}
                        errorMessage={errorMessage}
                        retryAIMessage={retryAIMessage}
                        onSaveMessage={handleSaveAiMessage}
                        onUpdateContent={(newContent) => onUpdateMessageContent(message.id, newContent)}
                        onTypingStart={() => {
                          if (!message.isUser) setIsTyping(true)
                        }}
                        onTypingComplete={() => {
                          if (!message.isUser) setIsTyping(false)
                        }}
                      />
                    </motion.div>
                  )
                })}

                {isThinking &&
                  <TypingIndicator />
                }
              </div>
            </div>
          </div>

          {/* Chat Input Bar */}
          <footer className='sticky bottom-0 w-full z-10 px-2'>
            {/* Suggested Prompts or Queued Prompts */}
            <AnimatePresence>
              {(hasQueuedPrompts || (messages.length === 0 && inputValue.trim() === "")) && (
                <motion.div
                  ref={promptContainerRef}
                  className={cn(
                    // isMobile ? 'no-scrollbar' : 'scrollbar scrollbar-chat',
                    "absolute z-10 flex overflow-x-auto items-start justify-start gap-3 pb-4 lg:px-10 lg:pb-4 sm:mb-3",
                    'no-scrollbar'
                  )}
                  style={{ top: `-${promptHeight + 4}px` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {(hasQueuedPrompts
                    ? queuedPrompts
                    : defaultSuggestions.map((prompt, i) => ({
                      id: `default-${i}`,
                      prompt,
                      title: 'پیشنهاد گفتگو',
                      description: ''
                    }))
                  ).map((prompt) => (
                    <div
                      key={prompt.id}
                      onClick={() => {
                        onSuggestionClick(prompt.prompt)
                        queuedPrompts.forEach(p => onRemoveQueuedPrompt(p.id))
                      }}
                      className="group shrink-0 max-w-3/5 md:max-w-1/2 cursor-pointer rounded-3xl bg-neutral-100 dark:bg-[#2a2a2a]/80 py-3 px-4 backdrop-blur-md transition-all md:hover:bg-[#9b956d]/25 active:bg-[#9b956d]/25"
                      dir="rtl"
                    >
                      <div className="flex items-start gap-5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold mb-2 mt-0.5">
                            {prompt.title}
                          </p>
                          {prompt.description && (
                            <p className="text-xs text-neutral-500">
                              {prompt.description}
                            </p>
                          )}
                          <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                            {prompt.prompt}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <ChatInput
              // key={conversationId || 'new-chat'}
              inputValue={inputValue}
              isTyping={isTyping}
              shouldResetAudio={shouldResetAudio}
              setShouldResetAudio={setShouldResetAudio}
              isThinking={isThinking}
              setIsTyping={setIsTyping}
              uploadedFiles={uploadedFiles}
              removeUploadedFile={removeUploadedFile}
              onInputChange={onInputChange}
              onSendMessage={onSendMessage}
              setIsUploadPanelOpen={setIsUploadPanelOpen}
            />

            <UploadPanel
              isOpen={isUploadPanelOpen}
              onClose={() => setIsUploadPanelOpen(false)}
              onContractUpload={onContractUpload}
              onStartChatWithPrompt={onStartChatWithPrompt}
            />

            <SavedMessagesManager
              isOpen={isFileManagerOpen}
              onClose={onCloseFileManager}
            />
            <SaveMessageDialog
              isOpen={isSaveDialogOpen}
              defaultTitle={defaultSaveTitle}
              defaultCaseId={defaultCaseId}
              messageText={messageToSave?.text || ''}
              onSubmit={({ title, caseId, caseName }) => {
                if (!messageToSave) return
                addSavedFile({
                  messageId: messageToSave.id,
                  title,
                  category: caseName || 'عمومی',
                  content: messageToSave.text.trim(),
                  caseId,
                })
                setDefaultCaseId(caseId)
                setIsSaveDialogOpen(false)
                setMessageToSave(null)
                onOpenFileManager()
              }}
              onClose={() => {
                setIsSaveDialogOpen(false)
                setMessageToSave(null)
              }}
            />
          </footer>
        </div>

        <AnimatePresence>

          {(isMobile && !collapsed) || showScrollButton &&
            <motion.div
              key="scroll-to-bottom-wrapper"
              initial={{ opacity: 1, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={cn(
                collapsed ? "translate-x-1/2 md:translate-x-1/2" : "translate-x-1/2 md:-translate-x-36",
                "fixed bottom-20 md:bottom-28 mb-safe right-1/2 z-[9]"
              )}
            >
              <motion.button
                key="scroll-to-bottom"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const container = chatContainerRef.current
                  if (container) {
                    container.scrollTo({
                      top: container.scrollHeight,
                      behavior: 'smooth'
                    })
                  }
                }}
                className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-full aspect-square shadow-lg hover:bg-[#8a844f] hover:text-white cursor-pointer"
              >
                <ArrowDown className="size-5 m-auto" />
              </motion.button>
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </>
  )
}
