'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from "next/navigation"

import Sidebar from '@/app/_ui/chat/sidebar'
import ChatInterface from '@/app/_ui/chat/chatInterface'
import Introduction from '@/app/_ui/introduction/section'

import { useChat } from '@/app/_lib/hooks/useChat'
import { apiService } from '@/app/_lib/services/api'
import { useUserStore } from '@/app/_lib/hooks/store'
import { useIsMobile } from '@/app/_lib/hooks/use-mobile'
import { useChatStore } from '@/app/_lib/hooks/useChatStore'

export default function C() {
  const isMobile = useIsMobile()
  const { user, updateUser, removeUser } = useUserStore()
  const [isAuthenticating, setIsAuthenticating] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false)

  useEffect(() => {
    setSidebarCollapsed(isMobile)
  }, [isMobile])

  const router = useRouter()
  const pathname = usePathname()
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const {
    inputValue,
    setInputValue,
    messages,
    isThinking,
    setIsThinking,
    inputRef,
    error,
    handleSendMessage,
    handleKeyPress,
    handleSuggestionClick,
    resetChatMode,
    loadConversation,
    suggestions,
    queuedPrompts,
    uploadedFiles = [],
    removeUploadedFile,
    retryAIMessage,
    removeQueuedPrompt,
    startNewConversation,
    startChatWithPrompt,
    updateMessageContent,
    handleContractUpload,
    shouldResetAudio,
    setShouldResetAudio,
  } = useChat()

  const { draftMessage, setDraftMessage } = useChatStore()

  useEffect(() => {
    const authenticateAndLoadUser = async () => {

      if (!apiService.token) {
        setIsAuthenticating(false)
        removeUser()
        return
      }

      try {
        const userInfo = await apiService.getCurrentUser()
        updateUser({ id: userInfo.id, name: userInfo.username })
      } catch (error) {
        console.error("Authentication failed:", error)
        apiService.setToken(null)
        setIsAuthenticating(false)
        removeUser()
      }
    }
    authenticateAndLoadUser()
  }, [pathname, removeUser, router, updateUser])

  useEffect(() => {
    if (!draftMessage) return

    const messageToSend = draftMessage
    setDraftMessage('')
    handleSendMessage(messageToSend)
  }, [draftMessage, handleSendMessage, setDraftMessage])

  const handleGoToMainPage = () => {
    resetChatMode()
    router.push("/")
  }

  function toggleSidebarWithVibration() {
    setSidebarCollapsed(!sidebarCollapsed)

    if (window.navigator.vibrate) {
      window.navigator.vibrate(50)
    }

    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  return (
    <div className="h-screen flex">
      <Sidebar
        messages={messages}
        useIsMobile={useIsMobile}
        collapsed={sidebarCollapsed}
        chatContainerRef={chatContainerRef}
        onOpenFileManager={() => setIsFileManagerOpen(true)}
        onGoToMainPage={handleGoToMainPage}
        onLoadConversation={loadConversation}
        onContractUpload={handleContractUpload}
        onStartChatWithPrompt={startChatWithPrompt}
        onStartNewConversation={startNewConversation}
        onToggle={toggleSidebarWithVibration}
        setSidebarCollapsed={(collapsed) => setSidebarCollapsed(collapsed)}
      />

      <ChatInterface
        useIsMobile={useIsMobile}
        messages={messages}
        isThinking={isThinking}
        setIsThinking={setIsThinking}
        retryAIMessage={retryAIMessage}
        uploadedFiles={uploadedFiles}
        removeUploadedFile={removeUploadedFile}
        shouldResetAudio={shouldResetAudio}
        setShouldResetAudio={setShouldResetAudio}
        chatContainerRef={chatContainerRef}
        errorMessage={error}
        inputRef={inputRef}
        inputValue={inputValue}
        onKeyPress={handleKeyPress}
        suggestions={suggestions}
        collapsed={sidebarCollapsed}
        onInputChange={setInputValue}
        onSendMessage={handleSendMessage}
        onSuggestionClick={handleSuggestionClick}
        onUpdateMessageContent={updateMessageContent}
        queuedPrompts={queuedPrompts}
        onRemoveQueuedPrompt={removeQueuedPrompt}
        onContractUpload={handleContractUpload}
        onStartChatWithPrompt={startChatWithPrompt}
        isFileManagerOpen={isFileManagerOpen}
        onOpenFileManager={() => setIsFileManagerOpen(true)}
        onCloseFileManager={() => setIsFileManagerOpen(false)}
      />

      <Introduction
        open={!user?.id && !isAuthenticating}
        onClose={() => setIsAuthenticating(false)}
      />
    </div>
  )
}
