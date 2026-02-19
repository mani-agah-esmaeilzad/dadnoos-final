import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowUp,
  AudioLines,
  Pause,
  PlusIcon,
  X,
  Play,
  Trash2,
  PencilLine,
  Mic,
  Settings2,
} from "lucide-react";

import { VoiceStatusBar } from "@/app/_ui/chat/VoiceStatusBar";
import { Button } from "@/app/_ui/components/button";

import { useIsMobile } from "@/app/_lib/hooks/use-mobile";
import { apiService } from "@/app/_lib/services/api";
import { cn } from "@/app/_lib/utils";
import Image from "next/image";
import { toast } from "sonner";
import { useNotifContext } from "../notif";

export type UploadedFile = {
  id: string;
  file?: File;
  fileName: string;
  fileSize: number;
  type: "contract" | "document";
};

interface ChatInputProps {
  inputValue: string;
  isTyping: boolean;
  isThinking: boolean;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;

  voiceStatus?: {
    voiceEnabled: boolean;
    autoSendVoice: boolean;
    autoPlayResponses: boolean;
    voiceLiveEnabled: boolean;
    voiceLiveStatus: "idle" | "connecting" | "live" | "error";
    voiceLiveError?: string;
    isVoiceLiveRunning: boolean;
    transcripts: string[];
    responses: { text: string }[];
  };
  onOpenVoiceSettings?: () => void;
  onStartVoiceLive?: () => void;
  onStopVoiceLive?: () => void;

  onInputChange: (value: string) => void;
  onSendMessage: (message: string) => void | Promise<void>;
  setIsUploadPanelOpen: (callback: (prev: boolean) => boolean) => void;
  uploadedFiles?: UploadedFile[];
  removeUploadedFile?: (id: string) => void;
  shouldResetAudio?: boolean;
  setShouldResetAudio?: any;
  voiceEnabled?: boolean;
  autoSendVoice?: boolean;
}

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string | null;
      if (!result) return reject(new Error("Failed to read blob"));
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

export default function ChatInput({
  inputValue,
  isTyping,

  voiceStatus,
  onOpenVoiceSettings,
  onStartVoiceLive,
  onStopVoiceLive,

  setIsTyping,
  isThinking,
  uploadedFiles = [],
  onInputChange,
  removeUploadedFile,
  onSendMessage,
  shouldResetAudio,
  setShouldResetAudio,
  setIsUploadPanelOpen,
  voiceEnabled = false,
  autoSendVoice = false,
}: ChatInputProps) {
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { showConfirm } = useNotifContext();

  const [isVoiceFullscreen, setIsVoiceFullscreen] = useState(false);

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(30).fill(5));
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const [isConverting, setIsConverting] = useState(false);
  const [playhead, setPlayhead] = useState(0);

  const adjustTextareaHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = `${Math.min(scrollHeight, 285)}px`;
    }
  }, []);

  useEffect(() => adjustTextareaHeight(), [inputValue, adjustTextareaHeight]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.visualViewport) return;

    const viewport = window.visualViewport;

    const handleViewportResize = () => {
      if (viewport.offsetTop > 0) {
        setKeyboardOpen(true);
      } else {
        setKeyboardOpen(false);
      }
    };

    viewport.addEventListener("resize", handleViewportResize);
    viewport.addEventListener("scroll", handleViewportResize);

    return () => {
      viewport.removeEventListener("resize", handleViewportResize);
      viewport.removeEventListener("scroll", handleViewportResize);
    };
  }, []);

  useEffect(() => {
    if (!isConverting && inputRef.current) {
      setTimeout(() => {
        inputRef.current!.style.height = "auto";
        const scrollHeight = inputRef.current!.scrollHeight;
        inputRef.current!.style.height = `${Math.min(scrollHeight, 285)}px`;
      }, 0);
    }
  }, [isConverting]);

  // --- Recording Audio
  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices
      .getUserMedia({ audio: true })
      .catch(() => null);
    if (!stream) {
      await showConfirm("برای ضبط صدا، دسترسی میکروفون لازم است.", [
        { label: "تایید", value: true, variant: "primary" },
      ]);
      return;
    }

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    setRecordingTime(0);
    setIsRecording(true);

    mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    mediaRecorder.start();

    // --- Wave visualization
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    let animationFrame: number;
    const processAudio = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const sensitivity = 3;
      const maxHeight = 35;
      const newHeights = waveHeights.map(() => {
        const height = (avg / 255) * maxHeight * sensitivity;
        return Math.max(5, Math.min(height, maxHeight));
      });
      setWaveHeights(newHeights);
      animationFrame = requestAnimationFrame(processAudio);
    };
    processAudio();

    // --- Timer
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setRecordingTime(elapsed);
    }, 250);

    // --- Auto stop after 60 seconds
    const autoStopTimer = setTimeout(() => {
      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    }, 60 * 1000);

    // --- Cleanup
    const cleanup = () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(timer);
      clearTimeout(autoStopTimer);
      audioContext.close();
      stream.getTracks().forEach((t) => t.stop());
    };

    mediaRecorder.onstop = () => {
      cleanup();
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      setIsRecording(false);
    };
  };

  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleConvertAudio = async () => {
    if (!recordedBlob) {
      await showConfirm("فایل صوتی موجود نیست.", [
        { label: "تایید", value: true, variant: "primary" },
      ]);

      return;
    }

    try {
      setIsConverting(true);
      const base64 = await blobToBase64(recordedBlob);
      const result = await apiService.speechToText(base64, "audio/webm");
      const finalText = result.text?.trim();
      if (!finalText) {
        await showConfirm("متن معتبری شناسایی نشد.", [
          { label: "تایید", value: true, variant: "primary" },
        ]);
      } else if (voiceEnabled && autoSendVoice) {
        onSendMessage(finalText);
      } else {
        onInputChange(result.text);
      }
    } catch (err) {
      console.error("Speech to Text Error:", err);
      alert("خطا در تبدیل گفتار به متن");
      await showConfirm("خطا در تبدیل گفتار به متن", [
        { label: "تایید", value: true, variant: "primary" },
      ]);
    }

    setIsConverting(false);
    setRecordedBlob(null);
    setAudioURL(null);
    setIsRecording(false);
  };

  const handleSendText = () => {
    const textToSend = inputValue.trim();
    if (!textToSend || isThinking || isTyping) return;
    onSendMessage(textToSend);
    onInputChange("");
  };

  // --- Update playhead for waveform
  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;
    const audio = audioRef.current;
    let animationFrame: number;

    const updatePlayhead = () => {
      if (!audio || !audio.duration) return;
      setPlayhead(audio.currentTime / audio.duration);
      animationFrame = requestAnimationFrame(updatePlayhead);
    };

    animationFrame = requestAnimationFrame(updatePlayhead);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    setPlayhead(0);
  }, [audioURL]);

  useEffect(() => {
    if (shouldResetAudio) {
      setAudioURL(null);
      setIsRecording(false);
      setIsPlaying(false);
      setRecordingTime(0);
      setAudioDuration(null);
      setPlayhead(0);
      setShouldResetAudio(false);
    }
  }, [shouldResetAudio]);

  return (
    <>
      {/* Voice Status Bar */}
      <AnimatePresence>
        {isVoiceFullscreen && voiceStatus && (
          <motion.div
            key="voice-fullscreen"
            initial={{
              scale: 0,
              borderRadius: "50rem",
              width: "1%",
              height: "1%",
            }}
            animate={{
              scale: 1,
              borderRadius: "0rem",
              width: "100%",
              height: "100%",
            }}
            exit={{ scale: 0, borderRadius: "50rem", width: "1", height: "1" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-white/25 dark:bg-black/25 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <Button
              size="icon_lg"
              variant="ghost"
              onClick={() => setIsVoiceFullscreen(false)}
              className="absolute top-0 md:top-2 end-2 rounded-full mt-safe"
            >
              <X className="size-6" />
            </Button>

            <Button
              size="icon_lg"
              variant="ghost"
              onClick={onOpenVoiceSettings ?? (() => {})}
              className="absolute top-0 md:top-2 start-2 rounded-full mt-safe"
            >
              <Settings2 className="size-6" />
            </Button>

            <VoiceStatusBar
              {...voiceStatus}
              onStartLive={onStartVoiceLive ?? (() => {})}
              onStopLive={onStopVoiceLive ?? (() => {})}
              onRetryLive={onStartVoiceLive ?? (() => {})}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendText();
        }}
        className={cn(
          !keyboardOpen && "mb-safe",
          "relative flex gap-x-1.5 items-end justify-center lg:px-0 max-w-full md:max-w-4xl mx-auto pb-3 md:pb-10",
        )}
      >
        <div className="relative flex w-full items-end rounded-3xl md:rounded-4xl bg-[#F2F2F2] md:bg-white border-0 md:border md:border-neutral-400/25 dark:md:border-transparent md:shadow-md dark:bg-[#303030] backdrop-blur-3xl transition-all px-1.5">
          <div className="flex flex-col items-center justify-center py-1.5 px-1">
            <div className="flex items-center gap-2">
              {voiceStatus &&
                inputValue.trim().length === 0 &&
                !isRecording &&
                !isThinking &&
                !audioURL &&
                !isTyping && (
                  <button
                    onClick={() => setIsVoiceFullscreen(true)}
                    className="aspect-square m-0.5 mr-0 h-8 flex items-center justify-center p-0.5 rounded-full cursor-pointer dark:bg-white bg-black dark:text-black text-white"
                    title="گفتگوی زنده"
                  >
                    <AudioLines className="size-4" />
                  </button>
                )}

              <button
                type="button"
                title={
                  isThinking
                    ? "در حال پاسخ"
                    : inputValue.trim().length > 0
                      ? "ارسال پیام"
                      : isRecording
                        ? "توقف ضبط"
                        : audioURL
                          ? "ارسال متن تبدیل"
                          : "تبدیل صدا به متن"
                }
                onClick={() => {
                  if (isConverting) {
                    return;
                  } else if (isThinking || isTyping) {
                    onSendMessage("__PAUSE_THINKING__");
                    setIsTyping(false);
                  } else if (inputValue.trim().length > 0) {
                    onSendMessage(inputValue);
                  } else if (isRecording) {
                    handleStopRecording();
                  } else if (audioURL) {
                    handleConvertAudio();
                  } else {
                    handleStartRecording();
                  }
                }}
                className={cn(
                  (isConverting ||
                    isTyping ||
                    isThinking ||
                    inputValue.trim().length > 0 ||
                    isRecording ||
                    audioURL) &&
                    "dark:bg-white bg-black dark:text-black text-white",
                  "aspect-square m-0.5 mr-0 h-8 flex items-center justify-center p-0.5 rounded-full cursor-pointer disabled:bg-black/75 dark:disabled:bg-white/75 disabled:opacity-50 disabled:cursor-auto",
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={
                      isConverting
                        ? "audioToText"
                        : isTyping
                          ? "typing"
                          : inputValue.trim().length > 0
                            ? "sendText"
                            : isRecording
                              ? "stop"
                              : audioURL
                                ? "sendAudio"
                                : "record"
                    }
                    whileTap={{ scale: 0.9 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.1, ease: "easeInOut" }}
                    className="flex items-center justify-center"
                  >
                    {isConverting ? (
                      <PencilLine className="size-4 animate-pulse" />
                    ) : isTyping || isThinking ? (
                      <div className="size-3 bg-white dark:bg-black/75 rounded-xs" />
                    ) : inputValue.trim().length > 0 ? (
                      <ArrowUp className="size-5" />
                    ) : isRecording ? (
                      <Pause className="size-4 animate-pulse" />
                    ) : audioURL ? (
                      <ArrowUp className="size-5" />
                    ) : (
                      <Mic className="size-5" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>

          <div className="flex items-center w-full my-auto">
            <AnimatePresence mode="wait">
              {/* Textarea */}
              {!isRecording && !audioURL && !isConverting && (
                <motion.div
                  key="textarea"
                  className="flex items-center justify-start w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex flex-col items-center justify-start w-full">
                    <div
                      className={cn(
                        // uploadedFiles.length === 0 ? "" : "ml-auto -mr-10 md:-mr-14",
                        "flex flex-wrap gap-0.5 w-full ml-auto -mr-10 md:-mr-14",
                      )}
                    >
                      <AnimatePresence>
                        {uploadedFiles.map((file) => (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              transition: { duration: 0.2, delay: 0.05 },
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0,
                              transition: { duration: 0.25 },
                            }}
                            className="relative flex flex-col items-center justify-center w-fit m-3 me-0 bg-white dark:bg-[#1f1f1f] rounded-2xl md:rounded-3xl overflow-hidden"
                          >
                            {file.file?.type.startsWith("image/") ? (
                              <Image
                                width={500}
                                height={500}
                                src={URL.createObjectURL(file.file)}
                                alt={file.fileName}
                                className="w-28 md:w-40 h-auto object-cover rounded-t-2xl"
                              />
                            ) : (
                              <>
                                <div className="w-60 h-16 md:h-20 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-t-2xl">
                                  <span className="font-bold text-neutral-600 dark:text-neutral-300 text-center">
                                    {file.fileName
                                      .split(".")
                                      .pop()
                                      ?.toUpperCase() || "FILE"}
                                  </span>
                                </div>
                                <div
                                  className="flex flex-col gap-1 items-start justify-center py-1.5 px-2.5 md:py-2.5 md:px-3.5 w-60"
                                  dir="auto"
                                >
                                  <p className="text-xs md:text-sm font-medium text-start truncate w-60">
                                    {file.fileName}
                                  </p>
                                  <p className="text-[10px] md:text-xs text-neutral-500 dark:text-neutral-400">
                                    {(file.fileSize / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeUploadedFile?.(file.id)}
                              className="absolute top-1.5 right-1.5 md:top-3 md:right-3 size-5 md:size-6 bg-neutral-400/25 backdrop-blur-sm p-0 rounded-full active:scale-110"
                              title="حذف فایل"
                            >
                              <X className="size-2.5 md:size-4 text-white" />
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => onInputChange(e.target.value)}
                      rows={1}
                      placeholder="سوال خود را بپرسید"
                      className="w-full h-fit scrollbar scrollbar-input p-2.5 pe-3 resize-none bg-transparent outline-none placeholder:opacity-65"
                      onKeyDown={(e) => {
                        if (isMobile) return;

                        if (e.key === "Enter") {
                          if (e.shiftKey) return;
                          e.preventDefault();
                          handleSendText();
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Audio recorder */}
              {isRecording && (
                <motion.div
                  key="recorder"
                  className="flex items-center justify-between w-full px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex gap-1 items-center justify-center h-10 overflow-hidden flex-1">
                    {waveHeights.map((h, i) => {
                      const randomOffset = (Math.random() - 1) * 12;
                      return (
                        <motion.div
                          key={i}
                          animate={{ height: Math.max(5, h + randomOffset) }}
                          transition={{ duration: 0.05, ease: "easeInOut" }}
                          className="w-0.5 md:w-1 bg-black dark:bg-white rounded-full"
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs mx-3">
                    {formatTime(recordingTime)}
                  </span>
                </motion.div>
              )}

              {/* Audio preview */}
              {audioURL && !isRecording && !isConverting && (
                <motion.div
                  key="audioPreview"
                  className="flex items-center justify-between w-full p-1 pl-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-center gap-2 flex-1">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (!audioRef.current) return;
                        if (isPlaying) {
                          audioRef.current.pause();
                          setIsPlaying(false);
                        } else {
                          audioRef.current.play();
                          setIsPlaying(true);
                        }
                      }}
                      className="p-0 size-9 aspect-square rounded-full flex items-center justify-center"
                    >
                      {isPlaying ? (
                        <Pause className="size-5" />
                      ) : (
                        <Play className="size-5" />
                      )}
                    </Button>
                    <audio
                      ref={audioRef}
                      src={audioURL}
                      onLoadedMetadata={() => {
                        const duration = audioRef.current?.duration;
                        if (duration && !isNaN(duration))
                          setAudioDuration(Math.round(duration));
                      }}
                      onCanPlay={() => {
                        const duration = audioRef.current?.duration;
                        if (duration && !isNaN(duration))
                          setAudioDuration(Math.round(duration));
                      }}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden sr-only"
                    />
                    <div
                      className="flex gap-1 items-center justify-center h-10 overflow-hidden"
                      dir="ltr"
                    >
                      {Array(30)
                        .fill(5)
                        .map((_, i) => {
                          const position = (i + 1) / 30;
                          const opacity = position <= playhead ? 1 : 0.2;
                          return (
                            <div
                              key={i}
                              style={{
                                height: `${15 + Math.sin(i) * 10}px`,
                                opacity: opacity,
                                transition:
                                  "opacity 0.5s ease, height 0.2s ease",
                              }}
                              className="w-0.5 md:w-1 bg-black dark:bg-white rounded-full"
                            />
                          );
                        })}
                    </div>
                    {audioDuration && (
                      <span className="text-xs mx-3">
                        {formatTime(audioDuration)}
                      </span>
                    )}
                  </div>
                  <Button
                    className="p-0 size-9 aspect-square rounded-full"
                    variant="ghost"
                    onClick={() => setAudioURL(null)}
                    title="حذف"
                  >
                    <Trash2 className="size-5" />
                  </Button>
                </motion.div>
              )}

              {isConverting && (
                <motion.div
                  key="converting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center w-full p-3 -mr-6"
                >
                  <div className="flex gap-1">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.span
                        key={i}
                        className="size-1.5 rounded-full bg-neutral-600 dark:bg-neutral-300"
                        animate={{
                          opacity: [0.2, 1, 0.2],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {!isRecording && !audioURL && !isConverting && (
          <div className="md:hidden w-12 min-w-12 aspect-square flex items-center justify-center rounded-full bg-[#F2F2F2] dark:bg-[#303030] backdrop-blur-3xl transition-all">
            <Button
              variant="ghost"
              className="md:hidden group cursor-pointer aspect-square p-2 h-full rounded-full flex items-center justify-center transition-opacity duration-200"
              title="بارگذاری فایل"
              onClick={() => setIsUploadPanelOpen((prev) => !prev)}
            >
              <PlusIcon className="size-5 group-active:scale-125 group-hover:scale-125 transition-transform duration-300" />
            </Button>
          </div>
        )}
      </form>
    </>
  );
}
