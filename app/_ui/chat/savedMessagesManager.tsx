import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  FolderPlus,
  FolderOpen,
  MinusCircle,
  Trash2,
  X,
  Plus,
  ChevronDown,
  Clock,
} from "lucide-react";
import Popup from "@/app/_ui/components/popup";
import { Button } from "@/app/_ui/components/button";
import { Input } from "@/app/_ui/components/input";
import {
  SavedMessageFile,
  useSavedMessagesStore,
} from "@/app/_lib/hooks/useSavedMessages";
import { saveAs } from "file-saver";
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Header,
  Footer,
  ImageRun,
} from "docx";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/app/_lib/hooks/use-mobile";

interface SavedMessagesManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavedMessagesManager({
  isOpen,
  onClose,
}: SavedMessagesManagerProps) {
  const files = useSavedMessagesStore((state) => state.files);
  const cases = useSavedMessagesStore((state) => state.cases);
  const removeFile = useSavedMessagesStore((state) => state.removeFile);
  const renameFile = useSavedMessagesStore((state) => state.renameFile);
  const updateCaseAssignment = useSavedMessagesStore(
    (state) => state.updateCaseAssignment,
  );
  const addCase = useSavedMessagesStore((state) => state.addCase);
  const renameCase = useSavedMessagesStore((state) => state.renameCase);
  const removeCase = useSavedMessagesStore((state) => state.removeCase);
  const ensureCasesInitialized = useSavedMessagesStore(
    (state) => state.ensureCasesInitialized,
  );
  const isMobile = useIsMobile();

  const [titleDrafts, setTitleDrafts] = useState<Record<string, string>>({});
  const [caseDrafts, setCaseDrafts] = useState<Record<string, string>>({});
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<
    "all" | "uncategorized" | string
  >("all");
  const [newCaseName, setNewCaseName] = useState("");
  const [massageViewManager, setMassageViewManager] = useState("");
  const [massageMobileViewManager, setMassageMobileViewManager] =
    useState("sidebar");

  useEffect(() => {
    if (!isOpen) return;
    ensureCasesInitialized();
    const drafts: Record<string, string> = {};
    files.forEach((file) => {
      drafts[file.id] = file.title;
    });
    setTitleDrafts(drafts);
    const caseDraftMap: Record<string, string> = {};
    cases.forEach((caseItem) => {
      caseDraftMap[caseItem.id] = caseItem.name;
    });
    setCaseDrafts(caseDraftMap);
  }, [files, cases, isOpen, ensureCasesInitialized]);

  const handleRenameFile = (id: string) => {
    const next = titleDrafts[id];
    renameFile(id, next || "");
  };

  const handleRenameCase = (id: string) => {
    const next = caseDrafts[id];
    renameCase(id, next || "");
  };

  const handleCreateCase = () => {
    const trimmed = newCaseName.trim();
    if (!trimmed) return;
    const created = addCase(trimmed);
    setSelectedCaseFilter(created.id);
    setNewCaseName("");
  };

  const handleDeleteCase = (id: string) => {
    removeCase(id);
    setSelectedCaseFilter((prev) => (prev === id ? "all" : prev));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "long",
    });
  };

  const caseMap = useMemo(
    () => new Map(cases.map((item) => [item.id, item])),
    [cases],
  );

  const sortedCases = useMemo(
    () => [...cases].sort((a, b) => b.createdAt - a.createdAt),
    [cases],
  );

  const caseCounts = useMemo(() => {
    const counts = new Map<string, number>();
    files.forEach((file) => {
      const key = file.caseId || "uncategorized";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [files]);

  const downloadAsWord = async (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    const caseName = file.caseId ? caseMap.get(file.caseId)?.name : undefined;
    const doc = await createBrandedDocument(file, caseName);
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${file.title || "پیام ذخیره‌شده"}.docx`);
  };

  const filteredFiles = useMemo(() => {
    if (selectedCaseFilter === "all") return files;
    if (selectedCaseFilter === "uncategorized") {
      return files.filter((file) => !file.caseId);
    }
    return files.filter((file) => file.caseId === selectedCaseFilter);
  }, [files, selectedCaseFilter]);

  const emptyState = files.length === 0;

  const handgeMassageopen = (fileId: string) => {
    if (massageViewManager == fileId) {
      setMassageViewManager("");
      return;
    }
    setMassageViewManager(fileId);
  };

  const handleUpdateCaseAssignment = (
    fileId: string,
    caseId: string | undefined,
  ) => {
    updateCaseAssignment(fileId, caseId);
    setSelectedCaseFilter(caseId ?? "all");
  };

  const handleVeiwInMobile = () => {
    setMassageMobileViewManager((c) =>
      c == "sidebar" ? "massages" : "sidebar",
    );
  };

  const handeFilterView = (filterId: string) => {
    setSelectedCaseFilter(filterId ?? "all");
    handleVeiwInMobile();
  };

  const massageAnimateVariants = {
    close: { height: "0", overflowY: "hidden" },
    open: { height: "auto", overflowY: "auto" },
  };

  return (
    <Popup visible={isOpen} onClose={onClose} width={"auto"}>
      <div
        className="flex flex-col gap-3 flex-1 min-h-0 w-full md:w-[800px] md:max-w-full box-border overflow-hidden"
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b border-gray-400/25 pb-3 pe-2 ps-2 mb-1 shrink-0 min-h-0">
          <div>
            <p className="text-lg font-semibold">
              فایل‌های ذخیره‌شده ({" "}
              {cases.length > 0
                ? `${cases.length} پرونده فعال`
                : "پرونده‌ای ثبت نشده"}{" "}
              )
            </p>
            <p className="text-xs text-neutral-500">
              پیام‌های AI را به فرمت Word دانلود کنید.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>
        <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-5 md:grid-rows-1 gap-4 md:gap-x-5 overflow-hidden box-border">
          <div
            className={`md:col-span-2 md:row-span-1 min-h-0 max-h-[60vh] md:max-h-none overflow-hidden flex flex-col rounded-3xl border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40 p-4 space-y-4 shrink md:flex-1`}
          >
            <div className="flex gap-2 flex-row">
              <Input
                value={newCaseName}
                onChange={(event) => setNewCaseName(event.target.value)}
                placeholder="جستجو یا افزودن"
                className="text-sm !rounded-2 mt-0"
              />
              <Button
                type="button"
                className=""
                disabled={!newCaseName.trim()}
                onClick={handleCreateCase}
              >
                <Plus className={"size-5"} />
              </Button>
              {isMobile && (
                <Button type="button" onClick={handleVeiwInMobile}>
                  <ChevronDown
                    className={`size-5 ${massageMobileViewManager == "sidebar" && "rotate-180"}`}
                  />
                </Button>
              )}
            </div>
            {(massageMobileViewManager == "sidebar" || !isMobile) && (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <motion.div
                  variants={isMobile ? massageAnimateVariants : {}}
                  initial="close"
                  animate="open"
                  exit="close"
                  className="flex flex-col flex-1 min-h-0 overflow-hidden"
                >
                  {sortedCases.length > 0 && (
                    <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto scrollbar">
                      {sortedCases.map(function (caseItem) {
                        if (newCaseName.trim().length > 0) {
                          if (!caseItem.name.includes(newCaseName.trim())) {
                            return;
                          }
                        }
                        return (
                          <div
                            key={caseItem.id}
                            className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/50 p-3 space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <Input
                                value={caseDrafts[caseItem.id] ?? caseItem.name}
                                onChange={(event) =>
                                  setCaseDrafts((prev) => ({
                                    ...prev,
                                    [caseItem.id]: event.target.value,
                                  }))
                                }
                                onBlur={() => handleRenameCase(caseItem.id)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.currentTarget.blur();
                                  }
                                }}
                                className="text-sm font-medium bg-transparent"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-neutral-500 hover:text-red-500"
                                onClick={() => handleDeleteCase(caseItem.id)}
                              >
                                <MinusCircle className="size-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-neutral-500">
                              <span>
                                ساخته شده:{" "}
                                {new Date(
                                  caseItem.createdAt,
                                ).toLocaleDateString("fa-IR")}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[11px] h-7 px-2 text-neutral-500"
                                onClick={() => handeFilterView(caseItem.id)}
                              >
                                مشاهده ({caseCounts.get(caseItem.id) || 0})
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </div>

          {(massageMobileViewManager == "massages" || !isMobile) && (
            <div className="col-span-3 row-span-1 flex-1 min-h-0 flex flex-col md:mt-0 overflow-hidden">
              <motion.div
                variants={isMobile ? massageAnimateVariants : {}}
                initial="close"
                animate="open"
                exit="close"
                className="flex flex-col flex-1 min-h-0 overflow-hidden"
              >
                {emptyState ? (
                  <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-600 px-6 py-10 text-center text-sm text-neutral-500">
                    هنوز پیامی ذخیره نشده است. روی آیکون ذخیره پیام هوش مصنوعی
                    بزنید تا در اینجا ببینید.
                  </div>
                ) : (
                  <>
                    {!isMobile && (
                      <div
                        className="flex overflow-x-auto gap-2 mb-4 sticky top-0 bg-white dark:bg-neutral-800 pt-1 pb-2 z-10 -mt-1 no-scrollbar snap-x snap-mandatory scroll-smooth touch-pan-x"
                        onWheel={(e) => {
                          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                            e.currentTarget.scrollBy({
                              left: e.deltaY,
                              behavior: "smooth",
                            });
                            e.preventDefault();
                          }
                        }}
                      >
                        <Button
                          variant={
                            selectedCaseFilter === "all" ? "secondary" : "ghost"
                          }
                          className="px-3 py-1 rounded-2xl text-xs min-w-max snap-start"
                          onClick={() => setSelectedCaseFilter("all")}
                        >
                          همه پرونده‌ها ({files.length})
                        </Button>
                        <Button
                          variant={
                            selectedCaseFilter === "uncategorized"
                              ? "secondary"
                              : "ghost"
                          }
                          className="px-3 py-1 rounded-2xl text-xs min-w-max snap-start"
                          onClick={() => setSelectedCaseFilter("uncategorized")}
                        >
                          بدون پرونده ({caseCounts.get("uncategorized") || 0})
                        </Button>
                        {sortedCases.map((caseItem) => (
                          <Button
                            key={caseItem.id}
                            variant={
                              selectedCaseFilter === caseItem.id
                                ? "secondary"
                                : "ghost"
                            }
                            className="px-3 py-1 rounded-2xl text-xs min-w-max snap-start"
                            onClick={() => setSelectedCaseFilter(caseItem.id)}
                          >
                            {caseItem.name} ({caseCounts.get(caseItem.id) || 0})
                          </Button>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col gap-3 px-1 flex-1 min-h-0 overflow-x-hidden overflow-y-auto scrollbar">
                      {filteredFiles.map((file) => {
                        const assignedCaseName = file.caseId
                          ? caseMap.get(file.caseId)?.name
                          : undefined;
                        return (
                          <div
                            key={file.id}
                            className="rounded-3xl bg-neutral-100 dark:bg-neutral-900 p-4 flex flex-col"
                          >
                            <div className="flex justify-between items-center gap-3">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-3 shadow-sm">
                                  <FileText className="size-5 text-[#9b956d]" />
                                </div>
                                <p className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                                  {titleDrafts[file.id] ?? file.title}
                                </p>
                              </div>

                              <div className="flex items-center gap-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-10 "
                                  onClick={() => downloadAsWord(file.id)}
                                >
                                  <Download className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-neutral-500 hover:text-red-500"
                                  onClick={() => removeFile(file.id)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-10"
                                  onClick={() => handgeMassageopen(file.id)}
                                >
                                  <ChevronDown
                                    className={`size-4 transition-transform ${massageViewManager == file.id ? "rotate-180" : "rotate-0"}`}
                                  />
                                </Button>
                              </div>
                            </div>
                            <div className="w-full">
                              {massageViewManager == file.id && (
                                <motion.div
                                  key={`massageView_${file.id}`}
                                  variants={massageAnimateVariants}
                                  initial="close"
                                  animate="open"
                                  exit="close"
                                  className="mt-3 pt-3 border-t-1 border-neutral-800"
                                >
                                  <div className="flex flex-col gap-2 mb-2">
                                    <div className="flex flex-col ">
                                      <p className="text-[11px] text-neutral-500 mb-1 mr-3">
                                        عنوان
                                      </p>
                                      <Input
                                        value={
                                          titleDrafts[file.id] ?? file.title
                                        }
                                        onChange={(event) =>
                                          setTitleDrafts((prev) => ({
                                            ...prev,
                                            [file.id]: event.target.value,
                                          }))
                                        }
                                        onBlur={() => handleRenameFile(file.id)}
                                        onKeyDown={(event) => {
                                          if (event.key === "Enter") {
                                            event.currentTarget.blur();
                                          }
                                        }}
                                        className="text-sm font-semibold bg-transparent focus-visible:ring-neutral-400"
                                      />
                                    </div>

                                    <div className="flex-1">
                                      <p className="text-[11px] text-neutral-500 mb-1 mr-3">
                                        پرونده
                                      </p>
                                      <select
                                        value={file.caseId ?? ""}
                                        onChange={(event) =>
                                          handleUpdateCaseAssignment(
                                            file.id,
                                            event.target.value
                                              ? event.target.value
                                              : undefined,
                                          )
                                        }
                                        className="w-full rounded-2xl border border-neutral-200/70 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/50 px-3 py-1.5 text-xs focus:outline-none"
                                      >
                                        <option value="">بدون پرونده</option>
                                        {sortedCases.map((caseItem) => (
                                          <option
                                            key={caseItem.id}
                                            value={caseItem.id}
                                          >
                                            {caseItem.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="text-[11px] px-2 py-1 rounded-full bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-200">
                                      {file.category || "عمومی"}
                                    </div>
                                  </div>

                                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line max-h-32 overflow-hidden">
                                    {file.content}
                                  </p>

                                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-800">
                                    <div className="flex flex-col text-[11px] text-neutral-500">
                                      <span>
                                        <FolderOpen className="inline-block size-3 ml-1 align-middle" />
                                        پرونده فعلی:{" "}
                                        {assignedCaseName || "بدون پرونده"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[11px] text-neutral-500 mt-1">
                                        <Clock className="inline-block size-3 ml-1 align-middle" />
                                        {formatDate(file.savedAt)}
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </Popup>
  );
}

async function loadLogoImage(): Promise<Uint8Array | null> {
  try {
    const res = await fetch("/logo.png");
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (error) {
    console.error("Failed to load logo for docx export:", error);
    return null;
  }
}

async function createBrandedDocument(
  file: SavedMessageFile,
  caseName?: string,
) {
  const paragraphs = textToParagraphs(file.content);
  const logoImage = await loadLogoImage();

  const headerChildren = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 100 },
      children: [
        logoImage
          ? new ImageRun({
              data: logoImage,
              type: "png",
              transformation: {
                width: 80,
                height: 80,
              },
            })
          : new TextRun({
              text: "Dadnoos",
              bold: true,
              size: 26,
              color: "3C2F23",
              rightToLeft: true,
            }),
      ],
    }),
  ];

  const infoParagraphs = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: file.title || "بدون عنوان",
          bold: true,
          size: 32,
          color: "1F1F1F",
          rightToLeft: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: `پرونده: ${caseName || "بدون پرونده"}`,
          size: 24,
          color: "4B4B4B",
          rightToLeft: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 320 },
      children: [
        new TextRun({
          text: `تاریخ ذخیره‌سازی: ${formatFaDate(file.savedAt)}`,
          size: 22,
          color: "6B6B6B",
          rightToLeft: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 320 },
      children: [
        new TextRun({
          text: `برچسب: ${file.category || "عمومی"}`,
          size: 22,
          color: "6B6B6B",
          rightToLeft: true,
        }),
      ],
    }),
  ];

  return new DocxDocument({
    title: file.title,
    creator: "Dadnoos AI",
    sections: [
      {
        headers: {
          default: new Header({
            children: headerChildren,
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "ساخته شده توسط سامانه حقوقی دادنوس",
                    size: 20,
                    color: "888888",
                    rightToLeft: true,
                  }),
                ],
              }),
            ],
          }),
        },
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              left: 720,
              bottom: 720,
            },
          },
        },
        children: [...infoParagraphs, ...paragraphs],
      },
    ],
  });
}

function formatFaDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function textToParagraphs(text: string) {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: text || "",
            rightToLeft: true,
          }),
        ],
        bidirectional: true,
        alignment: AlignmentType.RIGHT,
        spacing: { after: 120 },
      }),
    ];
  }

  return blocks.map(
    (block) =>
      new Paragraph({
        children: block.split("\n").map((line, index) => {
          if (index === 0)
            return new TextRun({
              text: line,
              rightToLeft: true,
            });
          return new TextRun({
            text: line,
            break: 1,
            rightToLeft: true,
          });
        }),
        bidirectional: true,
        alignment: AlignmentType.RIGHT,
        spacing: { after: 120 },
      }),
  );
}
