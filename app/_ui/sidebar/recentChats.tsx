import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/app/_ui/components/button"
import { Textarea } from "@/app/_ui/components/textarea"
import { Input } from "@/app/_ui/components/input"
import { cn } from "@/app/_lib/utils"
import { History, ChevronDown, Trash2, Check, Pencil, X, Ellipsis } from "lucide-react"
import { RefObject, useCallback, useEffect, useRef, useState } from "react"
import { Conversation } from "@/app/_lib/services/api"

interface RecentChatsProps {
  expandedSections: string[]
  toggleSection: (section: string) => void
  recentChats: Conversation[]
  onLoadConversation: (conversationId: string) => void
  setEditingChatId: (id: string | null) => void
  editingChatId: string | null
  editInputRef: RefObject<HTMLInputElement | null>
  editingTitle: string
  setEditingTitle: (title: string) => void
  handleRename: (id: string) => void
  isMobile: boolean
  onToggle: () => void
  handleDeleteConversation: (id: string) => void
  isScrolling: boolean
}

function ChatActionMenu({
  chatId,
  setEditingChatId,
  handleDeleteConversation,
  editingChatId,
  setSelectedChatId,
}: {
  chatId: string
  setEditingChatId: (id: string | null) => void
  handleDeleteConversation: (id: string) => void
  editingChatId: string | null
  setSelectedChatId: (id: string | null) => void
}) {
  if (editingChatId) return null

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="md:bg-transparent bg-white dark:bg-neutral-700 rounded-2xl md:w-full w-2/3 overflow-hidden flex flex-col shadow-xl"
    >
      <Button
        variant="ghost"
        onClick={() => setEditingChatId(chatId)}
        className="flex items-center justify-between px-4 py-6 w-full border-b border-neutral-200 dark:border-white/10 gap-3 rounded-none"
      >
        <span className="text-sm pe-3">تغییر عنوان</span>
        <Pencil className="size-5" />
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          handleDeleteConversation(chatId)
          setSelectedChatId(null)
        }}
        className="flex items-center justify-between px-4 py-6 w-full gap-3 rounded-none text-red-500"
      >
        <span className="text-sm pe-3">حذف گفتگو</span>
        <Trash2 className="size-5" />
      </Button>
    </motion.div>
  )
}

export default function RecentChats({
  expandedSections,
  toggleSection,
  recentChats,
  onLoadConversation,
  setEditingChatId,
  editingChatId,
  editInputRef,
  editingTitle,
  setEditingTitle,
  handleRename,
  isMobile,
  isScrolling,
  onToggle,
  handleDeleteConversation
}: RecentChatsProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | any>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [holdingChatId, setHoldingChatId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement | null>(null)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const holdTimer = useRef<NodeJS.Timeout | null>(null)

  if (recentChats.length === 0) return null

  const handleOpenMenu = (chatId: string) => {
    const button = buttonRefs.current[chatId]
    if (button) {
      const rect = button.getBoundingClientRect()
      const menuWidth = 160
      const menuHeight = 80
      let top = rect.bottom + 4
      let left = rect.right - menuWidth
      if (top + menuHeight > window.innerHeight) top = window.innerHeight - menuHeight - 8
      if (left < 8) left = 8
      setMenuPosition({ top, left })
      setSelectedChatId(chatId)
    }
  }

  const handleHoldStart = (chatId: string, e: React.MouseEvent | React.TouchEvent) => {
    if (!expandedSections.includes("recent-chats")) return

    e.preventDefault()

    let clientX = 0
    let clientY = 0

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else if ("clientX" in e) {
      clientX = e.clientX
      clientY = e.clientY
    }

    setTouchPosition({ x: clientX, y: clientY })

    setHoldingChatId(chatId)
    holdTimer.current = setTimeout(() => setSelectedChatId(chatId), 400)
  }

  const handleHoldEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    setHoldingChatId(null)
  }

  const setButtonRef = useCallback((chatId: string, el: HTMLButtonElement | null) => {
    if (el) buttonRefs.current[chatId] = el
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !Object.values(buttonRefs.current).some(btn => btn === event.target)
      ) {
        setOpenMenuId(null)
        setSelectedChatId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (editingChatId) {
      const chat = recentChats.find(c => c.chat_id === editingChatId)
      if (chat) {
        setEditingTitle(chat.title || `چت ${chat.chat_id.substring(0, 10)}`)
      }
    }
  }, [editingChatId, recentChats])


  const toggleMenu = (chatId: string) => {
    setOpenMenuId(prev => {
      if (prev === chatId) {
        setSelectedChatId(null)
        return null
      } else {
        setSelectedChatId(chatId)
        handleOpenMenu(chatId)
        return chatId
      }
    })
  }

  const variants = {
    open: { height: "auto", overflowY: "auto" },
    closed: { height: 0, overflowY: "hidden" }
  }

  return (
    <div className="w-full overflow-hidden border-b border-neutral-400/15 relative pb-1">
      {/* Action Bar - موبایل */}
      <AnimatePresence>
        {selectedChatId && (
          <div className="fixed w-screen inset-0 z-50 flex flex-col items-center justify-start md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { delay: 0.15 } }}
              className="absolute inset-0 backdrop-blur-md bg-white/50 dark:bg-black/50"
              onClick={() => {
                setSelectedChatId(null)
                setEditingChatId(null)
              }}
            />

            <motion.div
              key="content"
              initial={{ y: touchPosition.y - window.scrollY - 75 }}
              animate={{ y: 100 }}
              exit={{ y: touchPosition.y - window.scrollY - 75, opacity: 0 }}
              className="relative w-full max-w-md mt-8 p-4 flex flex-col items-start z-50"
            >
              {editingChatId === selectedChatId ? (
                <>
                  <h1 className="mx-auto mb-4">تغییر عنوان گفتگو</h1>
                  <div className="flex items-end justify-between w-full mb-2 rounded-3xl p-2 bg-neutral-400/25">
                    <Textarea
                      className="border-0 min-h-4 my-auto"
                      ref={editInputRef as any}
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleRename(selectedChatId)
                        if (e.key === "Escape") setEditingChatId(null)
                      }}
                    />
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleRename(selectedChatId)
                        setEditingChatId(null)
                      }}
                      className={cn(
                        editingTitle.trim() !== "" ? "opacity-100" : "opacity-0",
                        "p-0 aspect-square rounded-full transition-all dark:md:hover:bg-neutral-300/25 dark:active:bg-neutral-300/25 md:hover:bg-neutral-500/25 active:bg-neutral-500/25"
                      )}
                    >
                      <Check className="size-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setEditingChatId(null)}
                      className="p-0 aspect-square rounded-full ms-1 dark:md:hover:bg-neutral-300/25 dark:active:bg-neutral-300/25 md:hover:bg-neutral-500/25 active:bg-neutral-500/25"
                    >
                      <X className="size-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <p className="mb-6 w-3/4 text-lg">
                  {recentChats.find(c => c.chat_id === selectedChatId)?.title ||
                    `چت ${selectedChatId?.substring(0, 8)}`}
                </p>
              )}
              <ChatActionMenu
                chatId={selectedChatId}
                setEditingChatId={setEditingChatId}
                handleDeleteConversation={handleDeleteConversation}
                editingChatId={editingChatId}
                setSelectedChatId={setSelectedChatId}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Section Header */}
      <Button
        variant="ghost"
        className={cn(
          expandedSections.includes("recent-chats") ? "bg-neutral-300/25" : "",
          "w-full justify-between pr-3 pl-2 h-auto mb-1 mt-3 md:mt-0"
        )}
        onClick={() => {
          setIsAnimating(true);
          toggleSection("recent-chats");
        }}
      >
        <div className="flex items-center gap-3">
          <History className="size-6 font-medium" />
          <p>گفتگوهای اخیر</p>
        </div>
        <ChevronDown
          className={cn(
            expandedSections.includes("recent-chats") ? "rotate-0" : "rotate-90",
            "size-5 transition-all"
          )}
        />
      </Button>

      {/* Chat List */}
      <div className="relative w-full">
        <AnimatePresence initial={false}>
          {expandedSections.includes("recent-chats") && (
            <motion.div
              key="recent-chats"
              variants={variants}
              initial="closed"
              animate="open"
              exit="closed"
              onAnimationComplete={() => setIsAnimating(false)}
              className={cn(
                isAnimating ? "overflow-y-hidden no-scrollbar" : "overflow-y-auto scrollbar",
                "max-h-54 overflow-x-hidden"
              )}
              dir="ltr"
            >
              {recentChats.map(chat => (
                <motion.div
                  key={chat.chat_id}
                  layout
                  dir="rtl"
                  onClick={() => {
                    if (!expandedSections.includes("recent-chats")) return
                    if (editingChatId !== chat.chat_id) onLoadConversation(chat.chat_id)
                    if (isMobile) onToggle()
                  }}
                  onMouseDown={e => handleHoldStart(chat.chat_id, e)}
                  onMouseUp={handleHoldEnd}
                  onMouseLeave={handleHoldEnd}
                  onTouchStart={e => handleHoldStart(chat.chat_id, e)}
                  onTouchEnd={handleHoldEnd}
                  onTouchMove={handleHoldEnd}
                  className="group relative flex items-center gap-2 rounded-xl cursor-pointer"
                  animate={{ scale: holdingChatId === chat.chat_id ? isMobile ? 0.95 : 1 : 1 }}
                >
                  <div className="flex-1 w-full">
                    {isMobile && editingChatId === chat.chat_id ? (
                      <div className="flex items-center rounded-full px-2 border border-neutral-400/25">
                        <Input
                          className="border-0 my-auto"
                          type="text"
                          ref={editInputRef}
                          value={editingTitle}
                          onChange={e => setEditingTitle(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") handleRename(chat.chat_id)
                            if (e.key === "Escape") setEditingChatId(null)
                          }}
                        />
                        {editingTitle.trim() !== "" && (
                          <Button
                            variant="ghost"
                            onClick={() => {
                              handleRename(chat.chat_id)
                              setEditingChatId(null)
                            }}
                            className="p-0 size-7 aspect-square rounded-full"
                          >
                            <Check className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => setEditingChatId(null)}
                          className="p-0 size-7 aspect-square rounded-full"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between rounded-2xl py-2.5 pl-2 pr-4 md:hover:bg-neutral-400/15 active:bg-neutral-400/25">
                        <div className="w-10/12">
                          <p className="text-sm truncate">{chat.title || `گفتگو ${chat.chat_id.substring(0, 8)}`}</p>
                        </div>
                        <Button
                          ref={el => setButtonRef(chat.chat_id, el)}
                          variant="ghost"
                          className="hidden md:flex opacity-0 md:group-hover:opacity-100 p-0 size-7 aspect-square rounded-full"
                          onClick={e => {
                            e.stopPropagation()
                            toggleMenu(chat.chat_id)
                          }}
                        >
                          <Ellipsis className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isMobile && (
                    <div className="relative">
                      <AnimatePresence>
                        {openMenuId === chat.chat_id && editingChatId !== chat.chat_id && (
                          <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed rounded-xl shadow-lg flex flex-col z-50"
                            style={{ top: menuPosition.top, left: menuPosition.left }}
                          >
                            <ChatActionMenu
                              chatId={chat.chat_id}
                              setEditingChatId={setEditingChatId}
                              handleDeleteConversation={handleDeleteConversation}
                              editingChatId={editingChatId}
                              setSelectedChatId={setSelectedChatId}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* {expandedSections.includes("recent-chats") && (
          <div className="pointer-events-none absolute -bottom-2 left-0 w-full h-10 bg-gradient-to-t from-white md:from-neutral-50 dark:from-black md:dark:from-[#191919] to-transparent" />
        )} */}
      </div>
    </div>
  )
}