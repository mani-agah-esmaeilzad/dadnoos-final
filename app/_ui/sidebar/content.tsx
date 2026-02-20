import {
  ChevronDown,
  FileText,
  FileUp,
  FolderOpen,
  Gavel,
  Handshake,
  ImageUp,
  LibraryBig,
  MessageCircleDashed,
  NotebookText,
  Scale,
  School,
  UserRoundPen,
  UsersRound,
} from "lucide-react";

import * as texts from "@/app/_text/common.js";

import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/app/_ui/components/button";
import { cn } from "@/app/_lib/utils";

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
} from "@/app/_lib/legal-templates";

import {
  LegalTemplate,
  LegalTemplateForm,
} from "@/app/_ui/chat/legalTemplateForm";
import { Conversation } from "@/app/_lib/services/api";

import { useUserStore } from "@/app/_lib/hooks/store";
import { RefObject, useEffect, useRef, useState } from "react";

import { ContractUploadModal } from "@/app/_ui/chat/contractUploadModal";
import { logoutUser } from "@/app/_lib/user";
import ComingSoon from "@/app/_ui/coming-soon";

import ContactModal from "@/app/_ui/sidebar/contactModal";
import RecentChats from "@/app/_ui/sidebar/recentChats";
import Image from "next/image";
import Link from "next/link";
import { useSavedMessagesStore } from "@/app/_lib/hooks/useSavedMessages";
import Setting from "./setting";
import { useNotifContext } from "../notif";
import type { ModuleId } from "@/lib/chat/modules";

interface SidebarProps {
  isMobile: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onGoToMainPage?: () => void;
  toggleSection: (section: string) => void;
  expandedSections: string[];
  recentChats: Conversation[];
  onLoadConversation: (conversationId: string) => void;
  setEditingTitle: (title: string) => void;
  handleRename: (id: string) => void;
  handleDeleteConversation: (id: string) => void;
  setEditingChatId: (id: string | null) => void;
  editingChatId: string | null;
  onTemplateClick: (template: LegalTemplate, module?: ModuleId) => void;
  editInputRef: RefObject<HTMLInputElement | null>;
  editingTitle: string;
  selectedTemplate: LegalTemplate | null;
  isFormModalOpen: boolean;
  setIsFormModalOpen: (open: boolean) => void;
  handleNewChatClick: any;
  handleFormSubmit: (data: any) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  handleContractUpload: (file: File, type: "contract" | "document") => void;
  onStartChatWithPrompt: any;
  onOpenFileManager: () => void;
}

const verdictPredictionSuggestions = [
  "با توجه به رویه قضایی، احتمال صدور رأی به نفع خواهان در دعوای مطالبه وجه چقدر است؟",
  "احتمال موفقیت دعوای تخلیه ملک به استناد انقضای مدت اجاره چقدر است؟",
  "در پرونده کیفری کلاهبرداری، با این شرایط چه رأیی محتمل‌تر است؟",
  "اگر خوانده دفاعیات مشخصی ارائه دهد، تأثیر آن بر رأی دادگاه چیست؟",
];

const advisorySuggestions = [
  "نظریات مشورتی قوه قضاییه در مورد امور کیفری چگونه دسته‌بندی می‌شوند؟",
  "آخرین نظریات مشورتی در زمینه حقوق خانواده چیست؟",
  "نظریات مشورتی مرتبط با آیین دادرسی مدنی را توضیح بده.",
  "نقش نظریات مشورتی در رویه قضایی ایران چیست؟",
];

const rulingsSuggestions = [
  "آرای وحدت رویه چه جایگاهی در نظام حقوقی ایران دارند؟",
  "روند تصویب و انتشار آرای وحدت رویه چگونه است؟",
  "چند نمونه از آرای وحدت رویه مهم در حقوق کیفری را معرفی کن.",
  "تفاوت آرای وحدت رویه با نظریات مشورتی چیست؟",
];

const barExamSuggestions = [
  "یک برنامه‌ی سه‌ماهه برای آمادگی آزمون وکالت پیشنهاد بده.",
  "مهم‌ترین منابع آزمون وکالت در حقوق مدنی چیست؟",
  "چطور تست‌های آیین دادرسی مدنی را بهتر می‌توان تمرین کرد؟",
  "راهکارهای مدیریت زمان در جلسه آزمون وکالت چیست؟",
];

const menuSections = [
  {
    title: "اظهارنامه",
    icon: FileText,
    items: ["مطالبه وجه", "تخلیه ملک", "فسخ قرارداد", "سایر"],
  },
  {
    title: "دادخواست",
    icon: Scale,
    items: [
      "مطالبه وجه",
      "الزام به ایفای تعهد",
      "خلع ید و استرداد ملک",
      "فسخ قرارداد و خسارت",
      "سایر",
    ],
  },
  {
    title: "شکواییه",
    icon: Gavel,
    items: [
      "کلاهبرداری",
      "سرقت و خیانت در امانت",
      "توهین و افترا",
      "جرایم اینترنتی",
      "سایر",
    ],
  },
  {
    title: "لایحه",
    icon: NotebookText,
    items: [
      "دفاعیه کیفری",
      "اعتراضی به رأی",
      "دفاعیه حقوقی",
      "تخفیف مجازات",
      "سایر",
    ],
  },
  {
    title: "قرارداد",
    icon: Handshake,
    items: ["کار", "اجاره", "مشارکت", "خرید و فروش", "سایر"],
  },
];

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
  const user = useUserStore((state) => state.user);
  const [analysisType, setAnalysisType] = useState<"contract" | "document">(
    "contract",
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolledEnd, setIsScrolledEnd] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { showConfirm } = useNotifContext();

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;

      const END_OFFSET = 5;

      setIsScrolled(scrollTop > END_OFFSET);

      const maxScrollTop = scrollHeight - clientHeight;

      setIsScrolledEnd(scrollTop >= maxScrollTop - END_OFFSET);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  async function onClickLogout() {
    const ok = await showConfirm("خروج از برنامه مطمئن هستید؟");
    if (ok) {
      logoutUser()
        .then(() => {
          window.location.replace("/");
          if (isMobile) {
            onToggle();
          }
        })
        .catch(async () => {
          await showConfirm(
            "❌ مشکلی در خروج از حساب کاربری پیش آمد. لطفاً دوباره تلاش کنید.",
            [{ label: "بستن", value: true, variant: "danger" }],
          );
        });
    }
  }

  const [isOpenContactModal, setIsOpenContactModal] = useState(false);
  const toggleContactModal = () => setIsOpenContactModal((prev) => !prev);
  const savedFiles = useSavedMessagesStore((state) => state.files);

  return (
    <>
      <div
        ref={contentRef}
        className={cn(
          collapsed
            ? "overflow-hidden"
            : "overflow-y-auto sidebar-scroll scrollbar",
          !isMobile && collapsed
            ? "opacity-0"
            : "opacity-100 sm:delay-400 transition-opacity",
          "relative flex-1 overflow-x-hidden select-none pl-0.5",
        )}
      >
        <div className="grid px-2 md:px-1">
          <div
            className={cn(
              "pt-1 pb-1 border-b transition-all duration-300 sticky top-0 bg-white md:bg-neutral-50 md:dark:bg-[#191919] dark:bg-black z-10",
              isScrolled ? "border-neutral-400/15" : "border-transparent",
            )}
          >
            <div className="flex md:hidden items-center">
              <Link
                href="/"
                className="size-10 ms-1 aspect-square bg-transparent md:hover:bg-neutral-300/25 active:bg-neutral-300/25 rounded-xl p-1 transition-all"
              >
                <Image
                  className="size-full"
                  src="/logo.png"
                  alt={`${texts.websiteName} logo`}
                  width={180}
                  height={38}
                  priority
                />
              </Link>
              <button
                className="w-fit aspect-square px-1.5 py-2 transition-all hover:text-neutral-400 active:text-neutral-400 ms-auto"
                onClick={() => {
                  if (isMobile) {
                    onToggle();
                  }
                  handleNewChatClick();
                }}
              >
                <MessageCircleDashed className="size-6" />
              </button>
            </div>

            <Button
              variant="ghost"
              className="w-full hidden md:flex items-center aspect-square gap-2 px-3 h-10 justify-start transition-all"
              onClick={() => {
                if (isMobile) {
                  onToggle();
                }
                handleNewChatClick();
              }}
            >
              <MessageCircleDashed className="size-6" />
              <span className="mb-0.5">پرسش و پاسخ جدید</span>
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
                if (isMobile) onToggle();
                onOpenFileManager();
              }}
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="size-6" />
                <div className="flex flex-col text-right">
                  <h3>مدیریت پرونده</h3>
                  <span className="text-xs text-neutral-500">
                    {savedFiles.length === 0
                      ? "هنوز پرونده‌ای ذخیره نشده"
                      : `${savedFiles.length} پرونده ذخیره شده`}
                  </span>
                </div>
              </div>
            </Button>
          </div>

          <div className="grid gap-y-1 py-4">
            <Button
              variant="ghost"
              className="w-full justify-start px-3 h-auto"
              onClick={() => {
                setAnalysisType("contract");
                setIsUploadModalOpen(true);
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
                setAnalysisType("document");
                setIsUploadModalOpen(true);
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
              <h3 className="text-neutral-500 dark:text-neutral-400">
                تنظیم سند
              </h3>
            </div>

            <AnimatePresence initial={false}>
              {expandedSections.includes("legal-templates") && (
                <motion.div
                  key="legal-templates"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: { duration: 0.2 },
                  }}
                  className="mt-1 mb-1 overflow-hidden"
                >
                  {menuSections.map((section, index) => (
                    <div key={index}>
                      <Button
                        variant="ghost"
                        className={cn(
                          expandedSections.includes(section.title) &&
                            section.items
                            ? "bg-neutral-300/25"
                            : "",
                          "w-full justify-between pr-3 pl-2 mb-1 h-auto",
                        )}
                        onClick={() => toggleSection(section.title)}
                      >
                        <div className="flex items-center gap-3">
                          <section.icon className="size-6" />
                          <span className="text-md">{section.title}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            expandedSections.includes(section.title)
                              ? "rotate-0"
                              : "rotate-90",
                            "size-5 transition-all",
                          )}
                        />
                      </Button>

                      <AnimatePresence initial={false}>
                        {expandedSections.includes(section.title) &&
                          section.items && (
                            <motion.div
                              key={`${section.title}-items`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{
                                height: 0,
                                opacity: 0,
                                transition: { duration: 0.2 },
                              }}
                              className="space-x-0.5 overflow-hidden"
                            >
                              {section.items.map((item, itemIndex) => (
                                <Button
                                  key={itemIndex}
                                  variant="ghost"
                                  className="w-full justify-start border-0 p-2.5 pr-8 h-auto"
                                  onClick={() => {
                                    if (section.title === "اظهارنامه") {
                                      if (item === "مطالبه وجه")
                                        onTemplateClick(
                                          debtDeclarationTemplate,
                                          "declaration",
                                        );
                                      else if (item === "تخلیه ملک")
                                        onTemplateClick(
                                          evictionDeclarationTemplate,
                                          "declaration",
                                        );
                                      else if (item === "فسخ قرارداد")
                                        onTemplateClick(
                                          contractCancellationDeclarationTemplate,
                                          "declaration",
                                        );
                                      else if (item === "سایر")
                                        onTemplateClick(
                                          generalDeclarationTemplate,
                                          "declaration",
                                        );
                                    } else if (section.title === "دادخواست") {
                                      if (item === "مطالبه وجه")
                                        onTemplateClick(claimPaymentTemplate, "petition");
                                      else if (item === "الزام به ایفای تعهد")
                                        onTemplateClick(
                                          obligationFulfillmentTemplate,
                                          "petition",
                                        );
                                      else if (item === "خلع ید و استرداد ملک")
                                        onTemplateClick(
                                          propertyRestitutionTemplate,
                                          "petition",
                                        );
                                      else if (item === "فسخ قرارداد و خسارت")
                                        onTemplateClick(
                                          contractTerminationTemplate,
                                          "petition",
                                        );
                                      else if (item === "سایر")
                                        onTemplateClick(generalLawsuitTemplate, "petition");
                                    } else if (section.title === "شکواییه") {
                                      if (item === "کلاهبرداری")
                                        onTemplateClick(fraudComplaintTemplate, "complaint");
                                      else if (item === "سرقت و خیانت در امانت")
                                        onTemplateClick(theftComplaintTemplate, "complaint");
                                      else if (item === "توهین و افترا")
                                        onTemplateClick(
                                          defamationComplaintTemplate,
                                          "complaint",
                                        );
                                      else if (item === "جرایم اینترنتی")
                                        onTemplateClick(
                                          cyberCrimeComplaintTemplate,
                                          "complaint",
                                        );
                                      else if (item === "سایر")
                                        onTemplateClick(
                                          generalComplaintTemplate,
                                          "complaint",
                                        );
                                    } else if (section.title === "قرارداد") {
                                      if (item === "کار")
                                        onTemplateClick(
                                          employmentContractTemplate,
                                          "contract_drafting",
                                        );
                                      else if (item === "اجاره")
                                        onTemplateClick(
                                          rentalAgreementTemplate,
                                          "contract_drafting",
                                        );
                                      else if (item === "مشارکت")
                                        onTemplateClick(
                                          partnershipAgreementTemplate,
                                          "contract_drafting",
                                        );
                                      else if (item === "خرید و فروش")
                                        onTemplateClick(salesAgreementTemplate, "contract_drafting");
                                      else if (item === "سایر")
                                        onTemplateClick(
                                          generalContractTemplate,
                                          "contract_drafting",
                                        );
                                    } else if (section.title === "لایحه") {
                                      if (item === "دفاعیه کیفری")
                                        onTemplateClick(
                                          criminalDefenseTemplate,
                                          "brief",
                                        );
                                      else if (item === "اعتراضی به رأی")
                                        onTemplateClick(appealPetitionTemplate, "brief");
                                      else if (item === "دفاعیه حقوقی")
                                        onTemplateClick(civilDefenseTemplate, "brief");
                                      else if (item === "تخفیف مجازات")
                                        onTemplateClick(
                                          sentenceReductionTemplate,
                                          "brief",
                                        );
                                      else if (item === "سایر")
                                        onTemplateClick(
                                          generalPetitionTemplate,
                                          "brief",
                                        );
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
                  if (isMobile) onToggle();
                  onStartChatWithPrompt(
                    verdictPredictionSuggestions.map((p) => ({
                      prompt: p,
                      title: "پیش بینی رای",
                    })),
                    "verdict_prediction",
                  );
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
                  if (isMobile) onToggle();
                  onStartChatWithPrompt(
                    rulingsSuggestions.map((p) => ({
                      prompt: p,
                      title: "بانک آرای وحدت رویه",
                    })),
                  );
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
                  if (isMobile) onToggle();
                  onStartChatWithPrompt(
                    advisorySuggestions.map((p) => ({
                      prompt: p,
                      title: "بانک نظریات مشورتی",
                    })),
                  );
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
                  if (isMobile) onToggle();
                  onStartChatWithPrompt(
                    barExamSuggestions.map((p) => ({
                      prompt: p,
                      title: "آزمون وکالت",
                    })),
                  );
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
        title={analysisType === "contract" ? "آپلود قرارداد" : "آپلود سند"}
        description={
          analysisType === "contract"
            ? "قرارداد خود را برای تحلیل حقوقی و شناسایی ریسک‌ها آپلود کنید."
            : "سند یا مدرک خود را آپلود کنید تا نکات مهم آن تحلیل شود."
        }
      />

      <ContactModal isOpen={isOpenContactModal} onClose={toggleContactModal} />

      <Setting
        user={user}
        isMobile={isMobile}
        collapsed={collapsed}
        isScrolledEnd={isScrolledEnd}
        onClickLogout={onClickLogout}
        toggleContactModal={toggleContactModal}
      />
    </>
  );
}
