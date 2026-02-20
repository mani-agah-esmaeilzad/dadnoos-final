import { RefObject } from "react"
import {
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react"

import Image from "next/image"

import { websiteName } from "@/app/_text/common"

import { Button } from "@/app/_ui/components/button"
import SidebarContent from "@/app/_ui/sidebar/content"
import { LegalTemplate } from "@/app/_ui/chat/legalTemplateForm"
import type { ModuleId } from "@/lib/chat/modules"

import { Conversation } from "@/app/_lib/services/api"
import { cn } from "@/app/_lib/utils"

interface SidebarProps {
  isMobile: boolean
  collapsed: boolean
  onToggle: () => void
  onGoToMainPage?: () => void
  toggleSection: (section: string) => void
  expandedSections: string[]
  recentChats: Conversation[]
  onLoadConversation: (conversationId: string) => void
  setEditingTitle: (title: string) => void
  handleRename: (id: string) => void
  handleDeleteConversation: (id: string) => void;
  setEditingChatId: (id: string | null) => void
  editingChatId: string | null
  onTemplateClick: (template: LegalTemplate, module?: ModuleId) => void
  editInputRef: RefObject<HTMLInputElement | null>
  editingTitle: string
  selectedTemplate: LegalTemplate | null
  isFormModalOpen: boolean
  setIsFormModalOpen: (open: boolean) => void
  handleNewChatClick: any
  handleFormSubmit: (data: any) => void
  isUploadModalOpen: boolean
  setIsUploadModalOpen: (open: boolean) => void
  handleContractUpload: (file: File, type: 'contract' | 'document') => void
  onStartChatWithPrompt: any
  onOpenFileManager: () => void
}

export default function SidebarBody(props: SidebarProps) {
  const {
    isMobile,
    collapsed,
    onToggle,
    onGoToMainPage,
  } = props

  const sharedProps = { ...props }

  if (isMobile) {
    return (
      <div className="relative z-40">
        <div
          className={cn(
            "fixed inset-0 bg-neutral-300 dark:bg-neutral-800 transition-all duration-300",
            collapsed ? "opacity-0 pointer-events-none" : "opacity-75 dark:opacity-75"
          )}
          onClick={onToggle}
        />

        <div className={cn(
          "fixed right-0 h-full w-[85%] pt-safe bg-white md:dark:bg-[#191919] dark:bg-background flex flex-col transform transition-all duration-200",
          collapsed ? "translate-x-full opacity-100" : "translate-x-0 opacity-100"
        )}
        >

          <SidebarContent {...sharedProps} />

          <div className='absolute bottom-0 w-full h-8 bg-gradient-to-t from-white dark:from-background md:dark:from-[#191919] from-30%' />
        </div>
      </div>
    )
  } else {
    return (
      <aside
        className={cn(
          "transition-all duration-300 h-screen bg-white dark:bg-[#191919] border-l border-neutral-400/25 flex flex-col",
          !isMobile && collapsed ? "w-[60px] flex dark:bg-[#202020] pointer-events-none" : "xl:w-1/4 lg:w-1/2 md:w-2/3 bg-white md:bg-neutral-50 dark:bg-[#191919] dark:border-l dark:border-[#191919]",
        )}
      >
        <div className="group flex items-end justify-between px-2 h-12 pointer-events-auto z-10">
          <Button
            variant="ghost"
            className={cn(
              collapsed && "group-hover:hidden",
              "h-10 aspect-square rounded-xl p-0 group"
            )}
            onClick={onGoToMainPage}
          >
            <div className="size-full flex items-center justify-center scale-[85%] transition-all overflow-hidden z-10">
              <Image
                className="w-10 aspect-square"
                src="/logo.png"
                alt={`${websiteName} logo`}
                width={180}
                height={38}
                priority
              />
            </div>
          </Button>

          <Button
            variant="ghost"
            onClick={onToggle}
            className={cn(
              collapsed && "hidden group-hover:flex items-center justify-center",
              "h-10 aspect-square rounded-xl p-0 group text-neutral-500/75 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-e-resize"
            )}
            title={collapsed ? "باز کردن منو" : "بستن منو"}
          >
            {collapsed
              ? <PanelRightOpen className="size-6" />
              : <PanelRightClose className="size-6" />
            }
          </Button>
        </div>

        <SidebarContent {...sharedProps} />
      </aside>
    )
  }
}
