import {
  ChevronDown,
  ChevronLeft,
  FileText,
  FileUp,
  FolderOpen,
  Gavel,
  Handshake,
  HardDriveDownload,
  ImageUp,
  LibraryBig,
  LogOut,
  NotebookText,
  Scale,
  School,
  Settings,
  SquarePen,
  UserRoundPen,
  Users,
  UsersRound
} from "lucide-react"

import * as texts from '@/app/_text/common.js'

import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/app/_ui/components/button"
import { cn } from "@/app/_lib/utils"

import {
  claimPaymentTemplate,
  obligationFulfillmentTemplate,
  propertyRestitutionTemplate,
  contractTerminationTemplate,
  generalLawsuitTemplate,
  employmentContractTemplate,
  rentalAgreementTemplate,
  partnershipAgreementTemplate,
  salesAgreementTemplate,
  generalContractTemplate,
  fraudComplaintTemplate,
  theftComplaintTemplate,
  defamationComplaintTemplate,
  cyberCrimeComplaintTemplate,
  generalComplaintTemplate,
  criminalDefenseTemplate,
  appealPetitionTemplate,
  civilDefenseTemplate,
  sentenceReductionTemplate,
  generalPetitionTemplate,
  debtDeclarationTemplate,
  evictionDeclarationTemplate,
  contractCancellationDeclarationTemplate,
  generalDeclarationTemplate,
} from '@/app/_lib/legal-templates'

import { LegalTemplate, LegalTemplateForm } from "@/app/_ui/chat/legalTemplateForm"
import { Conversation } from "@/app/_lib/services/api"

import { useRouter } from "next/navigation"
import { useUserStore } from "@/app/_lib/hooks/store"
import { RefObject, useEffect, useRef, useState } from "react"

import { ContractUploadModal } from "@/app/_ui/chat/contractUploadModal"
import { logoutUser } from "@/app/_lib/user"
import ComingSoon from "@/app/_ui/coming-soon"

import ContactModal from "@/app/_ui/sidebar/contactModal"
import RecentChats from "@/app/_ui/sidebar/recentChats"
import Image from "next/image"
import Link from "next/link"
import { useSavedMessagesStore } from "@/app/_lib/hooks/useSavedMessages"

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
  onTemplateClick: (template: LegalTemplate) => void
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

const advisorySuggestions = [
  'نظریات مشورتی قوه قضاییه در مورد امور کیفری چگونه دسته‌بندی می‌شوند؟',
  'آخرین نظریات مشورتی در زمینه حقوق خانواده چیست؟',
  'نظریات مشورتی مرتبط با آیین دادرسی مدنی را توضیح بده.',
  'نقش نظریات مشورتی در رویه قضایی ایران چیست؟',
]

const rulingsSuggestions = [
  'آرای وحدت رویه چه جایگاهی در نظام حقوقی ایران دارند؟',
  'روند تصویب و انتشار آرای وحدت رویه چگونه است؟',
  'چند نمونه از آرای وحدت رویه مهم در حقوق کیفری را معرفی کن.',
  'تفاوت آرای وحدت رویه با نظریات مشورتی چیست؟',
]

const barExamSuggestions = [
  'یک برنامه‌ی سه‌ماهه برای آمادگی آزمون وکالت پیشنهاد بده.',
  'مهم‌ترین منابع آزمون وکالت در حقوق مدنی چیست؟',
  'چطور تست‌های آیین دادرسی مدنی را بهتر می‌توان تمرین کرد؟',
  'راهکارهای مدیریت زمان در جلسه آزمون وکالت چیست؟',
]

const menuSections = [
  {
    title: "لایحه",
    icon: NotebookText,
    items: ["دفاعیه کیفری", "اعتراضی به رأی", "دفاعیه حقوقی", "تخفیف مجازات", "سایر"],
  },
  {
    title: "دادخواست",
    icon: Scale,
    items: ["مطالبه وجه", "الزام به ایفای تعهد", "خلع ید و استرداد ملک", "فسخ قرارداد و خسارت", "سایر"],
  },
  {
    title: "شکواییه",
    icon: Gavel,
    items: ["کلاهبرداری", "سرقت و خیانت در امانت", "توهین و افترا", "جرایم اینترنتی", "سایر"],
  },
  {
    title: "قرارداد",
    icon: Handshake,
    items: ["کار", "اجاره", "مشارکت", "خرید و فروش", "سایر"],
  },
  {
    title: "اظهارنامه",
    icon: FileText,
    items: ["مطالبه وجه", "تخلیه ملک", "فسخ قرارداد", "سایر"],
  },
]

export default function SidebarContent({
  isMobile,
  collapsed,
  onToggle,
  toggleSection,
  expandedSections,
  recentChats,
  onLoadConversation,
  setEditingTitle,
  handleRename,
  handleDeleteConversation,
  setEditingChatId,
  editingChatId,
  onTemplateClick,
  editInputRef,
  editingTitle,
  selectedTemplate,
  isFormModalOpen,
  onStartChatWithPrompt,
  setIsFormModalOpen,
  handleNewChatClick,
  handleFormSubmit,
  isUploadModalOpen,
  setIsUploadModalOpen,
  handleContractUpload,
  onOpenFileManager,
}: SidebarProps) {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const [analysisType, setAnalysisType] = useState<'contract' | 'document'>('contract')
  const [isScrolled, setIsScrolled] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const handleScroll = () => {
      setIsScrolled(el.scrollTop > 5)
    }

    el.addEventListener("scroll", handleScroll)
    return () => el.removeEventListener("scroll", handleScroll)
  }, [])

  async function onClickLogout() {
    if (window.confirm("خروج از برنامه مطمئن هستید؟")) {
      logoutUser()
        .then(() => {
          window.location.replace('/')
          if (isMobile) {
            onToggle()
          }
        })
        .catch(() => {
          alert("❌ مشکلی در خروج از حساب کاربری پیش آمد. لطفاً دوباره تلاش کنید.")
        })
    }
  }

  const [isOpenContactModal, setIsOpenContactModal] = useState(false)
  const toggleContactModal = () => setIsOpenContactModal(prev => !prev)
  const savedFiles = useSavedMessagesStore((state) => state.files)

  return (
    <>
      <div
        ref={contentRef}
        className={cn(
          collapsed ? "overflow-hidden" : "overflow-y-auto sidebar-scroll scrollbar",
          !isMobile && collapsed ? "opacity-0" : "opacity-100 sm:delay-400 transition-opacity",
          "relative flex-1 overflow-x-hidden overscroll-none select-none pl-0.5"
        )}
      >
        <div className="grid px-2 md:px-1">
          <div className={cn(
            "pt-1 pb-1 border-b transition-all duration-300 sticky top-0 bg-white md:bg-neutral-50 md:dark:bg-[#191919] dark:bg-black z-10",
            isScrolled ? "border-neutral-400/15" : "border-transparent"
          )}
          >
            <div className="flex md:hidden items-center">
              <Link href="/" className="size-10 ms-1 aspect-square bg-transparent md:hover:bg-neutral-300/25 active:bg-neutral-300/25 rounded-xl p-1 transition-all">
                {/* <div className="size-full">
                  <svg xmlns="http://www.w3.org/2000/svg" strokeWidth="5" fill="white" version="1.0" viewBox="0 0 1024 1024">
                    <path d="M316 178.6c-15.1 1.8-37.4 8.6-51 15.4-18.6 9.3-39.8 26.3-52.9 42.3-15.1 18.5-25.2 38.9-31.2 63.1-2.7 10.6-3.1 14.5-3.6 30.6-.4 14.4-.2 21 1.1 29.9 10 67.7 63.4 122.9 129.6 134.2 10.9 1.8 15.9 1.9 84.5 1.7l73-.3 6.7-3.2c3.7-1.7 8.7-5 11.2-7.4 5.7-5.2 11.2-16.1 12.6-24.9 1.3-8.6 1.3-114.9 0-131.4-4.3-52.1-29.1-95.1-71.8-124-16.1-10.9-33.9-18.7-53.2-23.3-9.1-2.2-13.3-2.5-31-2.8-11.3-.2-22.1-.1-24 .1m46.2 19.5c26.9 5.4 52.7 19.2 72.8 38.9 20.6 20.2 33.7 44 40.2 73.1 2.3 10.3 2.3 10.8 2.3 80.4v70l-2.3 4.4c-2.9 5.4-6.5 8.8-11.7 11.2-3.8 1.7-8.1 1.9-73.1 1.9-64.7 0-69.8-.1-80.1-2-34.6-6.2-65.3-25.4-86.9-54.3-12.5-16.6-19.6-31.2-24.4-50.2-8.8-34.3-5-68.8 10.7-98.5 7.9-14.9 15.3-25.1 26.8-36.5 23.8-23.7 53.3-37.4 88-40.9 7.8-.8 28.2.5 37.7 2.5" />
                    <path d="M416.5 389.1c-6.8.8-12.2 3.8-17.4 9.4-6.7 7.3-8.6 12.4-8.6 23 0 10.5 2.1 15.8 8.7 22.6 6.1 6.3 13.7 9.4 22.8 9.4 9.1-.1 14.9-2.5 21.4-9.1 6.6-6.5 9-12.3 9.4-22.2.5-9.8-1.1-14.8-6.7-22-6.7-8.4-17.8-12.6-29.6-11.1m12.5 17.8c4.1 2.1 8 8.9 8 13.8 0 7.5-5.7 14.6-12.6 15.9-11.1 2.1-20.6-8.8-17.4-20 1.1-4.2 5.7-9.7 9-10.9s9.7-.6 13 1.2m235.5-227.8c-17.2 2.3-40.7 10.3-55.4 18.8-15.5 9.1-36.4 27.1-47.2 40.6-10.3 13-21.4 33.7-26.4 49.5-7.1 22.7-6.8 18.9-7.3 99-.4 76-.2 79 4 87.4 2.7 5.2 10.3 13.2 15.5 16.3 9 5.3 9.3 5.3 85.3 5.3 76.2 0 80.3-.2 98.5-5.5 26-7.5 50-22 69.8-42.2 30.6-31.1 45.9-68.4 46-112.3.1-37.5-12.4-71.5-37.3-101.3-22.3-26.6-55.1-46.5-88.8-53.8-11.1-2.4-44.4-3.5-56.7-1.8m47.7 18.5c50.2 9.5 92.8 45.9 109.7 93.7 10.1 28.6 10.6 57.6 1.5 87.1-3.6 11.7-14.4 32.7-21.8 42.6-8.4 11.2-24.2 26.3-34.7 33.2-14.7 9.7-26.9 15.1-44.9 20.1l-11.5 3.2-72 .3c-52.9.2-73.1 0-76.2-.9-5.8-1.6-11.6-6.8-14.4-13.1l-2.4-5.3-.3-58c-.4-65 .3-79.4 4.8-97.1 14.5-57.6 62.9-100.1 122-107.4 9.8-1.2 29.8-.4 40.2 1.6" />
                    <path d="M590 391.1c-13.1 5.9-21.4 21.6-18.9 35.6 4.4 23.9 30.8 34.8 50 20.7 8.6-6.3 12.9-15.3 12.9-26.9 0-6.3-.5-8.2-3.5-14.3-3.8-7.6-8.1-11.8-15.6-15.2-6.2-2.8-18.7-2.7-24.9.1m20 16.1c10 6.8 10.5 19.5 1.3 26.6-4.6 3.4-12.7 3.8-17 .6-6.7-5-9.1-16.2-4.7-22.1 3.4-4.6 8.2-7.3 12.9-7.3 2.7 0 5.4.8 7.5 2.2M308 529c-48.1 8.6-94.2 43.9-115.4 88.3-5.8 12-9.9 24-12.8 36.8-2 9.1-2.3 13.1-2.3 31.4 0 24.2 1.4 33.8 7.5 52.6 7.4 22.6 19.2 42.5 35.3 59.5 23.7 25.1 48.3 39.3 81.2 47 11.3 2.7 13.4 2.8 34.5 2.9 21.1 0 23.2-.2 34.1-2.8 35-8.3 63.2-25.3 87.5-53 5.9-6.6 16.7-22.3 20.4-29.7 10.1-20 15.9-41.2 18-66.5 1.2-15.4 1.2-122.6 0-132.4-2-14.9-10-26.4-22.8-32.4l-6.7-3.2-74-.2c-68.4-.1-74.8 0-84.5 1.7m156.5 17.7c4.6 2.5 8.5 6.4 11.1 11.3 1.8 3.3 1.9 7.2 1.9 75 0 64.7-.2 72.3-1.8 80-4.3 20.5-13.3 41.9-24.2 57.5-6.8 9.7-24.2 26.7-35 34.3-15.3 10.9-33.7 18.9-52.5 22.9-12.3 2.6-45.2 2.6-56.5-.1-48.4-11.3-86.8-44.6-103.8-90.1-6.2-16.5-10.4-42.9-9.2-58 3-37.9 15.6-65.6 42-92.1 13.2-13.3 23.6-21.1 37.1-27.7 17.4-8.6 31.3-13 46-14.6 4.4-.5 37.8-.8 74.4-.7 65.2.2 66.6.3 70.5 2.3" />
                    <path d="M412.1 571.1c-8.6 2.8-16.9 10.8-20.1 19.4-5.7 15.5 1.5 32.8 16.5 39.7 3.9 1.8 6.8 2.3 13 2.3 9.5 0 15-2.1 21.7-8.3 6.6-6.1 9.2-12 9.6-22 .4-7.7.2-8.8-2.7-14.7-7.1-14.3-23.1-21.2-38-16.4m20 19.6c4.8 5.1 5.8 9.8 3.4 15.9-3.4 8.9-13.4 12.6-21.5 7.8-5.4-3.1-7.5-6.8-7.4-13 0-6.1 1.9-9.4 7.5-13.2 2.8-2 4.3-2.3 8.8-1.9 4.8.3 5.9.9 9.2 4.4m124.7-62.3c-10.7 2.9-19.6 10.4-25.4 21.6l-2.9 5.5v75c0 74.3 0 75.1 2.3 86.3 13.3 65.5 60.8 114.7 123.9 128.3 13.5 2.9 42.7 3.7 56.8 1.5 25.4-3.9 49.9-14.1 70.5-29.4 9.4-6.9 27-24.5 33.7-33.6 15.5-21 26.2-47.1 30.4-74.1 1.9-11.7 1.6-36.1-.5-47.5-10.1-55.8-46.6-101.6-98.5-123.4-11.3-4.8-21.2-7.6-35.5-10.1-7.5-1.3-20.1-1.5-79.5-1.4-53.3 0-71.7.3-75.3 1.3M699.5 545c22.5 1.9 44.9 10.1 66.3 24.3 44.4 29.6 70.3 85.8 62.8 136.5-8.9 60.3-50.2 106-109 120.9-13.6 3.4-39.3 4.3-54.4 1.9-57.1-9-103.5-53.7-116.1-111.8-3.7-17-4.2-30.3-3.9-93.3l.3-60 2.8-5.8c3.2-6.4 8.9-11.1 15.4-12.6 5.2-1.1 122-1.2 135.8-.1" />
                    <path d="M595 570.6c-9.5 2.5-16.1 7.9-20.8 16.9-2.3 4.3-2.7 6.2-2.7 14s.4 9.7 2.7 14.1c3.2 6 9.3 11.8 15.7 14.7 6.5 3 18.7 3 25.3 0 6.2-2.9 12.8-9.1 15.8-15 3.2-6.3 4-18.4 1.6-24.8-3.9-10.1-11.9-17.3-22.2-20-7-1.8-8.3-1.8-15.4.1m14.8 17.3c11.3 5.8 10.4 22-1.6 27.3-7.7 3.4-15.8.1-19.3-7.8-1.8-4-1.9-5.1-.9-9.4 1.1-4.6 4.1-8.4 8.5-10.8 3.1-1.7 9.2-1.4 13.3.7" />
                  </svg>
                </div> */}
                <Image
                  className="size-full"
                  src="/logo.png"
                  alt={`${texts.websiteName} logo`}
                  width={180}
                  height={38}
                  priority
                />
                {/* <Image
                  className="size-full aspect-square hidden dark:block"
                  src="/logo-white.png"
                  alt={`${texts.websiteName} logo`}
                  width={180}
                  height={38}
                  priority
                />
                <Image
                  className="size-full aspect-square block dark:hidden"
                  src="/logo-black.png"
                  alt={`${texts.websiteName} logo`}
                  width={180}
                  height={38}
                  priority
                /> */}
              </Link>
              {/* <div className="ms-1">
                <p className="font-black text-[#C8A175]">
                  {texts.websiteName}
                </p>
              </div> */}

              <button
                className="w-fit aspect-square px-1.5 py-2 transition-all hover:text-neutral-400 active:text-neutral-400 ms-auto"
                onClick={() => {
                  if (isMobile) {
                    onToggle()
                  }
                  handleNewChatClick()
                }}
              >
                <SquarePen className="size-6" />
              </button>
            </div>

            <Button
              variant="ghost"
              className="w-full hidden md:flex items-center aspect-square gap-2 px-3 h-10 justify-start transition-all"
              onClick={() => {
                if (isMobile) {
                  onToggle()
                }
                handleNewChatClick()
              }}
            >
              <SquarePen className="size-6" />
              <span className="mb-0.5">
                پرسش و پاسخ جدید
              </span>
            </Button>
          </div>

          {recentChats.length !== 0 && (
            <RecentChats
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              recentChats={recentChats}
              onLoadConversation={onLoadConversation}
              handleDeleteConversation={handleDeleteConversation}
              setEditingChatId={setEditingChatId}
              editingChatId={editingChatId}
              editInputRef={editInputRef}
              editingTitle={editingTitle}
              setEditingTitle={setEditingTitle}
              handleRename={handleRename}
              isMobile={isMobile}
              onToggle={onToggle}
              isScrolling={isScrolled}
            />
          )}

          <div className="w-full overflow-hidden">
            <Button
              variant="ghost"
              className="w-full justify-between pr-3 pl-2 h-auto mt-2"
              onClick={() => {
                if (isMobile) onToggle()
                onOpenFileManager()
              }}
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="size-6" />
                <div className="flex flex-col text-right">
                  <h3>مدیریت پرونده</h3>
                  <span className="text-xs text-neutral-500">
                    {savedFiles.length === 0
                      ? 'هنوز پرونده‌ای ذخیره نشده'
                      : `${savedFiles.length} پرونده ذخیره شده`}
                  </span>
                </div>
              </div>
              <HardDriveDownload className="size-5 text-neutral-500" />
            </Button>
          </div>

          <div className="grid gap-y-1 py-4">
            <Button
              variant="ghost"
              className="w-full justify-start px-3 h-auto"
              onClick={() => {
                setAnalysisType('contract')
                setIsUploadModalOpen(true)
              }}
            >
              <div className="flex items-center gap-3">
                <FileUp className="size-6" />
                <h3 className="text-md">تحلیل قرارداد</h3>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start px-3 h-auto"
              onClick={() => {
                setAnalysisType('document')
                setIsUploadModalOpen(true)
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <ImageUp className="size-6" />
                  <h3 className="text-md">تحلیل سند</h3>
                </div>
              </div>
            </Button>
          </div>

          <div className="pt-4">
            <div className="mr-2 flex items-center gap-3 pb-2">
              <h3 className="text-neutral-500">تنظیم سند</h3>
            </div>

            <AnimatePresence initial={false}>
              {expandedSections.includes('legal-templates') && (
                <motion.div
                  key="legal-templates"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                  className="mt-1 mb-1 overflow-hidden"
                >
                  {menuSections.map((section, index) => (
                    <div key={index}>
                      <Button
                        variant="ghost"
                        className={cn(
                          expandedSections.includes(section.title) && section.items ? "bg-neutral-300/25" : "",
                          "w-full justify-between pr-3 pl-2 mb-1 h-auto"
                        )}
                        onClick={() => toggleSection(section.title)}
                      >
                        <div className="flex items-center gap-3">
                          <section.icon className="size-6" />
                          <span className="text-md">{section.title}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            expandedSections.includes(section.title) ? 'rotate-0' : 'rotate-90',
                            "size-5 transition-all"
                          )}
                        />
                      </Button>

                      <AnimatePresence initial={false}>
                        {expandedSections.includes(section.title) && section.items && (
                          <motion.div
                            key={`${section.title}-items`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                            className="space-x-0.5 overflow-hidden"
                          >
                            {section.items.map((item, itemIndex) => (
                              <Button
                                key={itemIndex}
                                variant="ghost"
                                className="w-full justify-start border-0 p-2.5 pr-8 h-auto"
                                onClick={() => {
                                  if (section.title === 'لایحه') {
                                    if (item === 'دفاعیه کیفری') onTemplateClick(criminalDefenseTemplate)
                                    else if (item === 'اعتراضی به رأی') onTemplateClick(appealPetitionTemplate)
                                    else if (item === 'دفاعیه حقوقی') onTemplateClick(civilDefenseTemplate)
                                    else if (item === 'تخفیف مجازات') onTemplateClick(sentenceReductionTemplate)
                                    else if (item === 'سایر') onTemplateClick(generalPetitionTemplate)
                                  } else if (section.title === 'دادخواست') {
                                    if (item === 'مطالبه وجه') onTemplateClick(claimPaymentTemplate)
                                    else if (item === 'الزام به ایفای تعهد') onTemplateClick(obligationFulfillmentTemplate)
                                    else if (item === 'خلع ید و استرداد ملک') onTemplateClick(propertyRestitutionTemplate)
                                    else if (item === 'فسخ قرارداد و خسارت') onTemplateClick(contractTerminationTemplate)
                                    else if (item === 'سایر') onTemplateClick(generalLawsuitTemplate)
                                  } else if (section.title === 'شکواییه') {
                                    if (item === 'کلاهبرداری') onTemplateClick(fraudComplaintTemplate)
                                    else if (item === 'سرقت و خیانت در امانت') onTemplateClick(theftComplaintTemplate)
                                    else if (item === 'توهین و افترا') onTemplateClick(defamationComplaintTemplate)
                                    else if (item === 'جرایم اینترنتی') onTemplateClick(cyberCrimeComplaintTemplate)
                                    else if (item === 'سایر') onTemplateClick(generalComplaintTemplate)
                                  } else if (section.title === 'قرارداد') {
                                    if (item === 'کار') onTemplateClick(employmentContractTemplate)
                                    else if (item === 'اجاره') onTemplateClick(rentalAgreementTemplate)
                                    else if (item === 'مشارکت') onTemplateClick(partnershipAgreementTemplate)
                                    else if (item === 'خرید و فروش') onTemplateClick(salesAgreementTemplate)
                                    else if (item === 'سایر') onTemplateClick(generalContractTemplate)
                                  } else if (section.title === 'اظهارنامه') {
                                    if (item === 'مطالبه وجه') onTemplateClick(debtDeclarationTemplate)
                                    else if (item === 'تخلیه ملک') onTemplateClick(evictionDeclarationTemplate)
                                    else if (item === 'فسخ قرارداد') onTemplateClick(contractCancellationDeclarationTemplate)
                                    else if (item === 'سایر') onTemplateClick(generalDeclarationTemplate)
                                  }
                                }}
                              >
                                {item}
                              </Button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid gap-y-0.5 py-3 border-t border-neutral-400/15 mt-3">
            <div>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 h-auto"
                onClick={() => {
                  if (isMobile) onToggle()
                  onStartChatWithPrompt(barExamSuggestions.map(p => ({ prompt: p, title: "پیش بینی رای" })))
                }}
              >
                <div className="flex items-center gap-3">
                  <UserRoundPen className="size-6" />
                  <h3>پیش بینی رای</h3>
                </div>
              </Button>
            </div>

            <div>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 h-auto"
                onClick={() => {
                  if (isMobile) onToggle()
                  onStartChatWithPrompt(advisorySuggestions.map(p => ({ prompt: p, title: "بانک نظریات مشورتی" })))
                }}
              >
                <div className="flex items-center gap-3">
                  <UsersRound className="size-6" />
                  <h3>بانک نظریات مشورتی</h3>
                </div>
              </Button>
            </div>

            <div>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 h-auto"
                onClick={() => {
                  if (isMobile) onToggle()
                  onStartChatWithPrompt(rulingsSuggestions.map(p => ({ prompt: p, title: "بانک آرای وحدت رویه" })))
                }}
              >
                <div className="flex items-center gap-3">
                  <LibraryBig className="size-6" />
                  <h3>بانک آرای وحدت رویه</h3>
                </div>
              </Button>
            </div>

            <div>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 h-auto"
                onClick={() => {
                  if (isMobile) onToggle()
                  onStartChatWithPrompt(barExamSuggestions.map(p => ({ prompt: p, title: "آزمون وکالت" })))
                }}
                disabled
              >
                <div className="flex items-center gap-3">
                  <School className="size-6" />
                  <h3>آمادگی آزمون وکالت</h3>
                </div>
                <ComingSoon />
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-safe mb-8 px-2 mt-10">
          <div className="flex items-center gap-x-2 my-3 px-3 text-neutral-500">
            <Settings className="size-6" />
            <h3>تنظیمات</h3>
          </div>

          <div>
            <Button onClick={() => router.push(!user?.id ? '/pricing' : '/subscription')} variant="ghost" className="group w-full border-0 justify-between pr-3 pl-2 h-auto">
              {!user?.id ? "خرید اشتراک" : "اشتراک"}
              <ChevronLeft className="size-5 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-75" />
            </Button>
            <Button onClick={() => router.push('/dananoos-vs-chatgpt')} variant="ghost" className="group w-full border-0 justify-between pr-3 pl-2 h-auto">
              فرق دادنوس با Chatgpt
              <ChevronLeft className="size-5 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-75" />
            </Button>
            <Button onClick={toggleContactModal} variant="ghost" className="group w-full border-0 justify-between pr-3 pl-2 h-auto">
              تماس با ما
              <ChevronLeft className="size-5 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-75" />
            </Button>
            {user.id &&
              <Button
                variant="ghost"
                onClick={onClickLogout}
                className="group w-full border-0 justify-between pr-3 pl-2 h-auto text-red-600/75"
              >
                <span className="font-semibold">
                  خروج
                </span>
                <LogOut className="size-5 transition-all group-hover:-rotate-180" />
              </Button>
            }
          </div>
        </div>
      </div>

      {selectedTemplate && (
        <LegalTemplateForm
          template={selectedTemplate}
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      <ContractUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={(file) => handleContractUpload(file, analysisType)}
        title={analysisType === 'contract' ? "آپلود قرارداد" : "آپلود سند"}
        description={analysisType === 'contract'
          ? "قرارداد خود را برای تحلیل حقوقی و شناسایی ریسک‌ها آپلود کنید."
          : "سند یا مدرک خود را آپلود کنید تا نکات مهم آن تحلیل شود."
        }
      />

      <ContactModal
        isOpen={isOpenContactModal}
        onClose={toggleContactModal}
      />
    </>
  )
}
