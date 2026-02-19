import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { getMarkdownRenderers } from "@/app/_ui/chat/markdownRenderers";
import { cn } from "@/app/_lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { MessageActions } from "@/app/_ui/chat/messageActions";
import { Button } from "@/app/_ui/components/button";
import { RefreshCcw } from "lucide-react";

import "katex/dist/katex.min.css";

import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Link from "next/link";
import Image from "next/image";
import { apiService } from "@/app/_lib/services/api";
import { useNotifContext } from "../notif";

// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface UploadedFile {
  id: string;
  file?: File;
  fileName: string;
  fileSize: number;
  type?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  files?: UploadedFile[];
  isHistory?: boolean;
}

interface MessageProps {
  message: ChatMessage;
  isLast: boolean;
  fontSize: number;
  onUpdateContent: (newContent: string) => void;
  typingSpeed?: number;
  isTyping: boolean;
  onTypingStart?: () => void;
  onTypingComplete?: () => void;
  retryAIMessage?: (messageId: string) => void;
  errorMessage?: any;
  onSaveMessage?: (message: ChatMessage) => void;
}

export function Message({
  isLast,
  message,
  fontSize,
  isTyping,
  onUpdateContent,
  onTypingStart,
  onTypingComplete,
  errorMessage,
  retryAIMessage,
  onSaveMessage,
}: MessageProps) {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("ویرایش سند");

  const [displayedText, setDisplayedText] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const frameRef = useRef<number | null>(null);
  const typedRef = useRef(false);
  const indexRef = useRef(0);
  const opacityRef = useRef(0);
  const { showConfirm } = useNotifContext();

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsAudioPlaying(false);
  }, [audioUrl]);

  const convertNumbersToPersian = (text: string) => {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return text.replace(/[0-9]/g, (d) => persianDigits[+d]);
  };

  useEffect(() => {
    if (!message.text) return;

    const containsLatex = /\${1,2}[^$]+\${1,2}/.test(message.text);

    if (
      message.isHistory ||
      message.isUser ||
      (containsLatex && !typedRef.current) ||
      typedRef.current
    ) {
      setDisplayedText(convertNumbersToPersian(message.text));
      typedRef.current = true;
      setTypingDone(true);
      onTypingComplete?.();
      return;
    }

    onTypingStart?.();
    setDisplayedText("");
    indexRef.current = 0;
    setTypingDone(false);

    function getNaturalTypingSpeed(charIndex: number, totalLength: number) {
      let baseSpeed = 5 + Math.random() * 2;

      if (charIndex < 3) baseSpeed += 2;

      const lengthFactor = totalLength > 80 ? 0.9 : 1;
      baseSpeed *= lengthFactor;

      const variance = (Math.random() - 0.5) * 2;

      return Math.max(1, baseSpeed + variance);
    }

    const type = () => {
      if (isTyping) {
        frameRef.current = requestAnimationFrame(type);
        return onTypingComplete?.();
      }

      if (indexRef.current < message.text.length) {
        const speed = getNaturalTypingSpeed(
          indexRef.current,
          message.text.length,
        );
        const nextIndex = Math.min(
          indexRef.current + Math.ceil(Math.random() * 3),
          message.text.length,
        );
        indexRef.current = nextIndex;

        const partial = message.text.slice(0, nextIndex);
        setDisplayedText(convertNumbersToPersian(partial));

        opacityRef.current = Math.min(1, nextIndex / message.text.length);

        setTimeout(() => {
          frameRef.current = requestAnimationFrame(type);
        }, speed);
      } else {
        typedRef.current = true;
        setDisplayedText(convertNumbersToPersian(message.text));
        setTypingDone(true);
        onTypingComplete?.();
      }
    };

    frameRef.current = requestAnimationFrame(type);
    return () => {
      if (frameRef?.current) cancelAnimationFrame(frameRef.current);
    };
  }, [message.text, message.isHistory]);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  useEffect(() => {
    cleanupAudio();
  }, [message.id, cleanupAudio]);

  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;
    audioRef.current.src = audioUrl;
    const playPromise = audioRef.current.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        setIsAudioPlaying(false);
      });
    }
  }, [audioUrl]);

  const copyToClipboard = async () => {
    try {
      const textToCopy = convertNumbersToPersian(message.text);
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleAudioToggle = async () => {
    if (!message.text?.trim()) return;
    if (isAudioLoading) return;
    if (audioUrl && audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => setIsAudioPlaying(false));
      }
      return;
    }
    try {
      setIsAudioLoading(true);
      const blob = await apiService.textToSpeech(message.text);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Failed to synthesize speech:", error);
      await showConfirm("پخش صوت با خطا مواجه شد.", [
        { label: "تایید", value: true, variant: "primary" },
      ]);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleSave = (newContent: string) => {
    const originalText = message.text;
    const updatedText = originalText.replace(
      /```doc([\s\S]*)```/,
      `\`\`\`doc\n${newContent}\n\`\`\``,
    );
    onUpdateContent(updatedText);
    setIsModalOpen(false);
  };

  const renderers = getMarkdownRenderers({
    setCopied,
    setIsModalOpen,
    isModalOpen,
    documentTitle,
    handleSave,
  });

  const isError =
    errorMessage === "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.";
  const isPaymentError =
    errorMessage === "اعتبار شما کافی نیست. لطفاً حساب خود را شارژ کنید.";

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
        className="hidden"
        onPlay={() => setIsAudioPlaying(true)}
        onPause={() => setIsAudioPlaying(false)}
        onEnded={() => {
          setIsAudioPlaying(false);
        }}
        onError={() => {
          setIsAudioPlaying(false);
          if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
          }
        }}
      />
      <AnimatePresence initial={false}>
        {message.files && message.files.length > 0 && (
          <motion.div
            key={`files-${message.id}`}
            className="mt-2 -mb-1 md:mb-2 flex flex-wrap gap-2 mx-2.5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            layout
          >
            {message.files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
                className="relative flex flex-col max-w-28 md:max-w-44 h-auto bg-neutral-100 dark:bg-neutral-800 rounded-xl items-center justify-center overflow-hidden"
              >
                {file.file?.type.startsWith("image/") ? (
                  <Image
                    width={500}
                    height={500}
                    src={URL.createObjectURL(file.file)}
                    alt={file.fileName}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <>
                    <div className="w-full h-16 md:h-20 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-t-xl">
                      <span className="text-xs text-neutral-600 dark:text-neutral-300 text-center">
                        {file.fileName.split(".").pop()?.toUpperCase() ||
                          "FILE"}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1 md:p-2 w-full">
                      <p className="text-xs md:text-sm font-medium text-center truncate w-full">
                        {file.fileName}
                      </p>
                      <p className="text-[10px] md:text-xs text-neutral-500 dark:text-neutral-400">
                        {(file.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "relative md:mt-0 z-30",
          message.isUser
            ? "ml-auto w-fit max-w-85/100 mt-3 md:mt-12"
            : isLast && "min-h-[46.5vh]",
        )}
      >
        <motion.div
          className={cn(
            "flex-shrink-0 relative z-20 overflow-x-hidden dark:text-neutral-300",
            message.isUser
              ? "mr-1 px-3.5 py-1.5 rounded-3xl w-fit bg-[#9b956d]/25 dark:bg-neutral-400/25"
              : "w-full px-4 mb-5 rounded-none",
          )}
        >
          <div
            className="max-w-screen leading-relaxed [overflow-wrap:anywhere] select-text overflow-y-hidden"
            style={{
              fontSize: isError
                ? `${message.isUser ? fontSize : 13}px`
                : `${message.isUser ? fontSize : fontSize + 1}px`,
              opacity: 1,
              transition: "opacity 0.1s linear",
            }}
            dir="auto"
          >
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
              components={renderers}
            >
              {displayedText}
            </ReactMarkdown>
          </div>
        </motion.div>

        {!errorMessage && (
          <MessageActions
            isLast={isLast}
            copied={copied}
            typingDone={typingDone}
            isUser={message.isUser}
            onCopy={copyToClipboard}
            onEdit={() => setIsModalOpen(true)}
            onSave={() => {
              if (!message.isUser) {
                onSaveMessage?.(message);
              }
            }}
            onPlayAudio={!message.isUser ? handleAudioToggle : undefined}
            onThumbsUp={() => console.log("Thumbs up")}
            onThumbsDown={() => console.log("Thumbs down")}
            disabledSave={message.isUser}
            audioLoading={isAudioLoading}
            audioPlaying={isAudioPlaying}
            audioDisabled={!message.text?.trim()}
          />
        )}

        {isLast && errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5 } }}
            transition={{ duration: 0.8 }}
            className="-ms-1.5 mt-3 flex flex-col w-screen min-h-[46.5vh] px-4 gap-2 text-neutral-800/50 dark:text-neutral-400/75"
          >
            <div
              className={cn(
                "px-4 w-fit py-3 border rounded-3xl text-sm",
                isError &&
                  "bg-red-500/5 dark:bg-red-500/10 border-red-500/25 dark:border-red-500/50 text-red-700/75 dark:text-red-600",
                isPaymentError &&
                  "bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/25 dark:border-indigo-500/50 text-indigo-700/75 dark:text-indigo-600",
              )}
            >
              {errorMessage}
            </div>

            <div className="flex gap-2">
              {isPaymentError ? (
                <Link className="w-fit" href="/pricing">
                  <Button
                    variant="ghost"
                    className="aspect-square p-0 pr-2 rounded-xl flex items-center gap-2"
                  >
                    <span className="text-sm ml-3 whitespace-nowrap">
                      خرید اشتراک
                    </span>
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  className="aspect-square p-0 pr-2 rounded-xl flex items-center gap-2"
                  onClick={() => retryAIMessage?.(message.id)}
                >
                  <RefreshCcw className="size-4" />
                  <span className="text-sm ml-3 whitespace-nowrap">
                    بازخوانی
                  </span>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
