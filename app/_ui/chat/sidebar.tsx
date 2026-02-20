import { useState, useEffect, useRef, useCallback } from "react";
import type { ModuleId } from "@/lib/chat/modules";

import { apiService, Conversation } from "@/app/_lib/services/api";
import { LegalTemplate } from "@/app/_ui/chat/legalTemplateForm";

import { Button } from "@/app/_ui/components/button";

import SidebarBody from "@/app/_ui/sidebar/body";
import { MessageCircleDashed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/app/_lib/utils";
import PricingButton from "@/app/_ui/pricing/pricing-button";
import { useUserStore } from "@/app/_lib/hooks/store";
import { useChat } from "@/app/_lib/hooks/useChat";
import Image from "next/image";

import * as texts from "@/app/_text/common.js";
import { useNotifContext } from "../notif";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onGoToMainPage?: () => void;
  useIsMobile: () => boolean;
  onLoadConversation: (conversationId: string) => void;
  onStartNewConversation: () => void;
  messages: any;
  setSidebarCollapsed: (collapsed: boolean) => void;
  onStartChatWithPrompt: any;
  onContractUpload: (file: File, type: "contract" | "document") => void;
  chatContainerRef: any;
  onOpenFileManager: () => void;
}

export default function Sidebar({
  collapsed,
  useIsMobile,
  onToggle,
  messages,
  onGoToMainPage,
  onLoadConversation,
  onStartNewConversation,
  onStartChatWithPrompt,
  onContractUpload,
  chatContainerRef,
  onOpenFileManager,
}: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "templates",
    "legal-templates",
  ]);
  const [recentChats, setRecentChats] = useState<Conversation[]>([]);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<LegalTemplate | null>(null);
  const [selectedTemplateModule, setSelectedTemplateModule] = useState<ModuleId | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  const isMobile = useIsMobile();
  const editInputRef = useRef<HTMLInputElement>(null);
  const user = useUserStore((state) => state.user);
  const { deleteConversation } = useChat();
  const { showConfirm } = useNotifContext();

  const fetchConversations = useCallback(async () => {
    if (!user.id || !apiService.token) return;
    try {
      const conversations = await apiService.getConversations(user.id);
      setRecentChats(conversations);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }, [user.id]);

  const handleDeleteConversation = async (chatId: string) => {
    const ok = await showConfirm("آیا از حذف این گفتگو مطمئن هستید؟");
    if (ok) {
      await deleteConversation(chatId);
      fetchConversations();
    }
  };

  const handleContractUpload = async (
    file: File,
    type: "contract" | "document",
  ) => {
    console.log("Uploading file for analysis:", file);
    setIsUploadModalOpen(false);

    try {
      await onContractUpload(file, type);
    } catch (error) {
      console.error("Failed to upload or analyze file:", error);
      const errorMessage =
        error instanceof Error ? error.message : "یک خطای ناشناخته رخ داده است";
      onStartChatWithPrompt(
        `متاسفانه در تحلیل ${type === "contract" ? "قرارداد" : "سند"} "${file.name}" مشکلی پیش آمد. \n\n**خطا:** ${errorMessage}`,
      );
    }
  };

  useEffect(() => {
    if (user.id) {
      fetchConversations();
    }
  }, [user.id, fetchConversations]);

  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingChatId]);

  useEffect(() => {
    if (!isMobile || collapsed) return;

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar-container");
      if (sidebar && !sidebar.contains(event.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, collapsed, onToggle]);

  useEffect(() => {
    if (isMobile && !collapsed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, collapsed]);

  const handleNewChatClick = () => {
    onStartNewConversation();
    setTimeout(() => {
      fetchConversations();
    }, 500);
  };

  const handleRename = async (chatId: string) => {
    if (!user?.id) return;
    if (!editingTitle.trim()) return;

    try {
      await apiService.updateChatTitle(user.id, chatId, editingTitle.trim());

      setRecentChats((prev) =>
        prev.map((chat) =>
          chat.chat_id === chatId
            ? { ...chat, title: editingTitle.trim() }
            : chat,
        ),
      );

      setEditingChatId(null);
    } catch (err) {
      await showConfirm("خطا در تغییر عنوان گفتگو", [
        { label: "تایید", value: true, variant: "primary" },
      ]);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  const handleTemplateClick = (template: LegalTemplate, module?: ModuleId) => {
    setSelectedTemplate(template);
    setSelectedTemplateModule(module ?? null);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (data: Record<string, any>) => {
    if (!selectedTemplate) return;

    let prompt = `با استفاده از اطلاعات زیر، یک پیش‌نویس کامل برای ${selectedTemplate.title.replace("فرم هوشمند ", "")} تهیه کن:\n\n`;

    selectedTemplate.fields.forEach((field) => {
      prompt += `- ${field.label}: ${data[field.name]}\n`;
    });

    prompt += `\nلطفاً متنی حقوقی و جامع با تمام مواد و تبصره‌های لازم ایجاد کن.`;

    onStartChatWithPrompt(prompt, selectedTemplateModule ?? undefined);
    setIsFormModalOpen(false);
    setSelectedTemplateModule(null);
    if (isMobile) onToggle();
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setHasScrolled(container.scrollTop > 0);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [chatContainerRef]);

  return (
    <>
      {isMobile && (
        <AnimatePresence>
          <div
            className={cn(
              "fixed top-0 pt-safe bg-white dark:bg-black md:dark:bg- [#202020] border-b flex items-center justify-between w-full transition-all duration-200 z-10 px-2 pb-1",
              hasScrolled ? "border-neutral-400/15" : "border-transparent",
              !collapsed && "-translate-x-[85%]",
            )}
          >
            <div className="size-12 flex items-center justify-start bg-white dark:bg-black">
              <div
                className="grid gap-1.5 p-4 py-3.5 rounded-lg cursor-pointer"
                onClick={() => {
                  onToggle();
                }}
              >
                <div className="bg-black dark:bg-white rounded-full h-0.5 w-4" />
                <div className="bg-black dark:bg-white rounded-full h-0.5 w-2" />
              </div>
            </div>

            {messages.length === 0 ? (
              <PricingButton />
            ) : (
              <p className="font-semibold pt-0.5 -ms-0.5">دادنوس</p>
            )}

            <div className="size-12 flex items-center justify-center">
              <AnimatePresence>
                {messages.length > 0 && collapsed ? (
                  <motion.div
                    key="new-conversation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute left-2 h-12 aspect-square flex items-center justify-center"
                  >
                    <Button
                      variant="ghost"
                      onClick={handleNewChatClick}
                      className="p-1 rounded-full bg-white dark:bg-black size-full flex items-center justify-center"
                    >
                      <MessageCircleDashed className="size-6" />
                    </Button>
                  </motion.div>
                ) : (
                  <Button
                    variant="ghost"
                    className="flex items-center justify-center p-1 h-10 aspect-square group hover:bg-transparent overflow-hidden bg-white dark:bg-black rounded-xl"
                    onClick={onGoToMainPage}
                  >
                    <Image
                      className="w-8 aspect-square"
                      src="/logo.png"
                      alt={`${texts.websiteName} logo`}
                      width={180}
                      height={38}
                      priority
                    />
                  </Button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </AnimatePresence>
      )}

      <SidebarBody
        isMobile={isMobile}
        collapsed={collapsed}
        onToggle={onToggle}
        onGoToMainPage={onGoToMainPage}
        recentChats={recentChats}
        editingChatId={editingChatId}
        setEditingChatId={setEditingChatId}
        editingTitle={editingTitle}
        setEditingTitle={setEditingTitle}
        editInputRef={editInputRef}
        onLoadConversation={onLoadConversation}
        handleRename={handleRename}
        handleDeleteConversation={handleDeleteConversation}
        expandedSections={expandedSections}
        handleNewChatClick={handleNewChatClick}
        toggleSection={toggleSection}
        isFormModalOpen={isFormModalOpen}
        setIsFormModalOpen={setIsFormModalOpen}
        isUploadModalOpen={isUploadModalOpen}
        setIsUploadModalOpen={setIsUploadModalOpen}
        selectedTemplate={selectedTemplate}
        onTemplateClick={handleTemplateClick}
        handleFormSubmit={handleFormSubmit}
        onStartChatWithPrompt={onStartChatWithPrompt}
        handleContractUpload={handleContractUpload}
        onOpenFileManager={onOpenFileManager}
      />
    </>
  );
}
