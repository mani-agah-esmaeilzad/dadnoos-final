import { useState, useRef, useCallback } from 'react'

import { useUserStore } from '@/app/_lib/hooks/store'
import { apiService, Message as ApiMessage, ChatRequest } from '@/app/_lib/services/api'

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  files?: any
  isHistory?: boolean
}

export class ApiError extends Error {
  status: number
  data?: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export type QueuedPrompt =
  | {
    id: string
    type: 'contract' | 'document'
    title: string
    description: string
    prompt: string
    fileName: string
    fileSize: number
    file?: File
  }
  | {
    id: string
    type: 'template'
    title: string
    description?: string
    prompt: string
  }

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '')
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const parseMessageContent = (content: string): string => {
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].text) {
      return parsed.map(p => p.text).join('\n')
    }
  } catch {
    return content
  }
  return content
}

export function useChat() {
  const user = useUserStore((state) => state.user)

  const [shouldResetAudio, setShouldResetAudio] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [chatMode, setChatMode] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [queuedPrompts, setQueuedPrompts] = useState<QueuedPrompt[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<QueuedPrompt[]>([])

  const addMessage = useCallback((
    content: string,
    isUser: boolean,
    files?: QueuedPrompt[]
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      text: content,
      isUser,
      timestamp: new Date(),
      files,
      isHistory: false,
    }
    setMessages(prev => [...prev, newMessage])
  }, [])

  const startNewConversation = () => {
    setConversationId(null)
    setMessages([])
    setInputValue('')
    setError(null)
    setQueuedPrompts([])
    setUploadedFiles([])
    setShouldResetAudio(true)
  }

  const loadConversation = async (chatId: string) => {
    if (!user.id || !apiService.token) return
    try {
      setIsThinking(true)
      const history = await apiService.getMessagesByConversation(user.id, chatId)
      const formattedMessages: ChatMessage[] = history.map((msg: ApiMessage) => ({
        id: Math.random().toString(),
        text: parseMessageContent(msg.content),
        isUser: msg.role === 'user',
        timestamp: new Date(msg.timestamp),
        isHistory: true,
      }))
      setMessages(formattedMessages)
      setConversationId(chatId)
    } catch (err) {
      console.error("Failed to load conversation:", err)
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری گفتگو')
    } finally {
      setIsThinking(false)
    }
  }

  const deleteConversation = async (chatId: string) => {
    if (!user.id || !apiService.token) return
    try {
      await apiService.deleteConversation(user.id, chatId)
      if (conversationId === chatId) {
        startNewConversation()
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err)
      setError(err instanceof Error ? err.message : 'خطا در حذف گفتگو')
    }
  }

  type PromptInput = { prompt: string, title: string }

  const startChatWithPrompt = (prompts: PromptInput[]) => {
    startNewConversation()

    setSuggestions(prompts.map(p => p.prompt))
    setQueuedPrompts(prompts.map(p => ({
      id: generateUUID(),
      type: 'template',
      title: p.title,
      description: undefined,
      prompt: p.prompt,
    })))
  }

  const removeQueuedPrompt = (promptId: string) => {
    setQueuedPrompts(prev => prev.filter(prompt => prompt.id !== promptId))
  }

  const handleContractUpload = async (file: File, category: 'contract' | 'document' = 'contract') => {
    const sanitizedName = file.name ?? (category === 'contract' ? 'قرارداد' : 'سند')
    const defaultPrompt =
      category === 'contract'
        ? `این قرارداد با نام "${sanitizedName}" را از نظر ریسک‌های حقوقی، تعهدات اصلی و بندهای حساس تحلیل کن.`
        : `این سند با نام "${sanitizedName}" را بررسی و نکات کلیدی و حقوقی آن را تحلیل کن.`

    const newFilePrompt: QueuedPrompt = {
      id: generateUUID(),
      type: category,
      title: category === 'contract' ? 'تحلیل قرارداد' : 'تحلیل سند',
      description: 'این محتوا همراه پیام بعدی ارسال می‌شود.',
      prompt: defaultPrompt,
      fileName: sanitizedName,
      fileSize: file.size,
      file,
    }

    setUploadedFiles(prev => [...prev, newFilePrompt])
  }

  const handleSendMessage = async (overrideMessage?: string) => {
    const messageText = overrideMessage ?? inputValue

    if (messageText === "__PAUSE_THINKING__") {
      setIsThinking(false)
      return
    }

    const hasQueuedPrompts = queuedPrompts.length > 0 || uploadedFiles.length > 0
    if ((!messageText.trim() && !hasQueuedPrompts) || !apiService.token) return

    setIsThinking(true)
    setError(null)

    const queuedSnapshot = [...queuedPrompts]
    const uploadedSnapshot = [...uploadedFiles]

    setQueuedPrompts([])
    setUploadedFiles([])

    try {
      const currentChatId = conversationId || generateUUID()
      if (!conversationId) { setConversationId(currentChatId) }

      const promptMessages: string[] = []
      const attachments: { base64: string, url: string, mime_type: string, filename: string }[] = []
      const images: { base64: string, url: string, mime_type: string }[] = []

      for (const prompt of queuedSnapshot) {
        if (prompt.prompt?.trim()) promptMessages.push(prompt.prompt.trim())
      }

      for (const fileItem of uploadedSnapshot) {
        if (fileItem.type !== 'contract' && fileItem.type !== 'document') continue
        const file = fileItem.file
        if (!file) continue

        try {
          const base64 = await fileToBase64(file)
          const mimeType = file.type || 'application/octet-stream'

          if (mimeType.startsWith('image/')) {
            images.push({
              base64, url: '',
              mime_type: mimeType
            })
          } else {
            attachments.push({
              base64,
              url: '',
              mime_type: mimeType,
              filename: file.name,
            })
          }
        } catch (err) {
          console.error(`❌ خطا در تبدیل فایل "${file.name}" به Base64:`, err)
        }
      }

      const finalMessage = [...promptMessages, messageText.trim()].filter(Boolean).join('\n\n')
      addMessage(finalMessage, true, uploadedSnapshot)
      setInputValue('')

      const requestBody = {
        user_id: user.id,
        chat_id: currentChatId,
        message: finalMessage,
        images,
        attachments,
        prompt: ''
      } as any

      const response = await apiService.sendMessage(requestBody)

      const aiMessage: ChatMessage = {
        id: Math.random().toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        isHistory: false,
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      const apiErr = err as ApiError

      if (apiErr.status === 402) {
        setError('اعتبار شما کافی نیست. لطفاً حساب خود را شارژ کنید.')
      } else {
        setError('ارتباط با سرور برقرار نشد. دوباره تلاش کنید.')
      }

      setQueuedPrompts(queuedSnapshot)
      setUploadedFiles(uploadedSnapshot)
    } finally {
      setIsThinking(false)
    }
  }

  const retryAIMessage = async (messageId: string) => {
    const aiMessageIndex = messages.findIndex(msg => msg.id === messageId)
    if (aiMessageIndex <= 0) return

    const userMessage = messages[aiMessageIndex - 1]
    if (!userMessage?.isUser) return

    setIsThinking(true)
    setError(null)

    try {
      const currentChatId = conversationId || generateUUID()
      if (!conversationId) setConversationId(currentChatId)

      // جمع‌آوری فایل‌ها و تصاویر همراه پیام
      const attachments: { base64: string, url: string, mime_type: string, filename: string }[] = []
      const images: { base64: string, url: string, mime_type: string }[] = []

      if (userMessage.files) {
        for (const fileItem of userMessage.files) {
          if (fileItem.type !== 'contract' && fileItem.type !== 'document') continue
          const file = fileItem.file
          if (!file) continue

          const base64 = await fileToBase64(file)
          const mimeType = file.type || 'application/octet-stream'

          if (mimeType.startsWith('image/')) {
            images.push({
              base64, url: '',
              mime_type: mimeType
            })
          } else {
            attachments.push({
              base64,
              url: '',
              mime_type: mimeType,
              filename: file.name,
            })
          }
        }
      }

      const request: ChatRequest = {
        message: userMessage.text,
        chat_id: currentChatId,
        images,
        attachments,
        prompt: ''
      }

      const response = await apiService.sendMessage(request)

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? {
              ...msg,
              text: response.response,
              isHistory: false,
            }
            : msg
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بازخوانی پاسخ')
    } finally {
      setIsThinking(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (query: string) => {
    setInputValue(query)
    inputRef.current?.focus()
  }

  const removeUploadedFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
    setQueuedPrompts(prev => prev.filter(p => p.id !== id))
  }

  const resetChatMode = () => {
    setChatMode(false)
    setMessages([])
    setInputValue('')
    setIsThinking(false)
    setConversationId(null)
    setError(null)
  }

  const updateMessageContent = (messageId: string, newContent: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, text: newContent } : msg
      )
    )
  }

  return {
    chatMode,
    inputValue,
    setInputValue,
    messages,
    retryAIMessage,
    isThinking,
    setIsThinking,
    error,
    inputRef,
    handleSendMessage,
    handleKeyPress,
    handleSuggestionClick,
    resetChatMode,
    loadConversation,
    startNewConversation,
    startChatWithPrompt,
    suggestions,
    shouldResetAudio,
    setShouldResetAudio,
    queuedPrompts,
    removeQueuedPrompt,
    updateMessageContent,
    handleContractUpload,
    deleteConversation,
    uploadedFiles,
    removeUploadedFile
  }
}
