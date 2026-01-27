import React from "react"
import { Copy, Expand } from "lucide-react"
import { Components } from "react-markdown"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/_ui/components/dialog"
import { DocumentCanvas } from "@/app/_ui/chat/documentCanvas"
import { Button } from "@/app/_ui/components/button"

import { cn } from "@/app/_lib/utils"

export function getMarkdownRenderers({
  setCopied,
  setIsModalOpen,
  isModalOpen,
  documentTitle,
  handleSave,
}: {
  setCopied: (val: boolean) => void
  setIsModalOpen: (val: boolean) => void
  isModalOpen: boolean
  documentTitle: string
  handleSave: (content: string) => void
}): Components {
  const renderers: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "")
      const language = match ? match[1] : "plaintext"
      const codeText = String(children).replace(/\n{3,}/g, "\n\n").trim()

      if (!codeText) return null

      const isMathLang = ["math", "latex", "katex"].includes(language)

      if (isMathLang) {
        return (
          <div className="my-3 overflow-x-auto">
            <pre className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md whitespace-pre">
              <code {...props}>{children}</code>
            </pre>
          </div>
        )
      }

      if (language === "doc") {
        return (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="my-4">
                <Expand className="size-4 ml-2" />
                مشاهده و ویرایش سند
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-[1200px] h-[90vh] flex flex-col p-6">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>{documentTitle}</DialogTitle>
              </DialogHeader>
              <div className="flex-grow overflow-y-auto -mx-6 px-6">
                <DocumentCanvas
                  title={documentTitle}
                  content={codeText}
                  onSave={handleSave}
                />
              </div>
            </DialogContent>
          </Dialog>
        )
      }

      const programmingLangs = [
        "js", "jsx", "ts", "tsx", "python", "py", "java", "c", "cpp",
        "cs", "php", "go", "rb", "rust", "swift", "kotlin", "sql",
        "html", "css", "bash", "sh", "yaml", "json"
      ]

      const isProgrammingLang = programmingLangs.includes(language)

      if (!isProgrammingLang) {
        return (
          <div className="my-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800 md:dark:bg-neutral-900 py-4 px-5">
            <code
              className={cn(
                className,
                "block font-serif text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-line break-words"
              )}
              {...props}
              dir='auto'
            >
              {children}
            </code>
          </div>
        )
      }

      const copyCode = async () => {
        try {
          await navigator.clipboard.writeText(codeText)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (err) {
          console.error("خطا در کپی: ", err)
        }
      }

      return (
        <div className="relative my-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 md:dark:bg-neutral-900 overflow-hidden">
          <div className="flex justify-between items-center px-2.5 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-800 md:dark:bg-neutral-900">
            <span className="font-mono px-3 text-neutral-800 dark:text-neutral-300">
              {language}
            </span>
            <Button
              variant="ghost"
              onClick={copyCode}
              className="flex items-cente gap-1.5 p-3"
            >
              <Copy className="size-4" />
              {/* <span>کپی</span> */}
            </Button>
          </div>

          <pre className="p-6 text-sm overflow-x-auto scrollbar" dir='auto'>
            <code className={cn(className, "font-sans")} {...props}>
              {codeText}
            </code>
          </pre>
        </div>
      )
    },

    p: ({ children }) => <p className="leading-relaxed my-1">{children}</p>,

    h1: (props) => <h1 className="text-2xl font-black my-4" {...props} />,
    h2: (props) => <h2 className="text-2xl font-black mt-4 mb-8" {...props} />,
    h3: (props) => <h3 className="text-lg font-semibold my-2" {...props} />,
    h4: (props) => <h4 className="text-sm font-medium mt-3 mb-1" {...props} />,
    h5: (props) => <h5 className="text-sm font-medium mt-2 mb-1" {...props} />,
    h6: (props) => <h6 className="text-sm font-medium mt-2 mb-1 text-neutral-600" {...props} />,

    hr: (props) => <hr className="my-8 border-neutral-400/25" {...props} />,
    br: (props) => <br className="my-2" {...props} />,
    strong: (props) => <strong className="font-semibold text-md py-0" {...props} />,
    em: (props) => <em className="italic" {...props} />,
    del: (props) => <del className="line-through" {...props} />,
    ul: (props) => <ul className="list-disc list-inside mb-2 py-0" {...props} />,
    ol: (props) => <ol className="list-decimal list-inside mb-2" {...props} />,
    li: (props) => <li className="my-0.5" {...props} />,
    a: (props) => <a className="text-blue-500 md:hover:underline active:underline" {...props} />,
    blockquote: (props) => <blockquote className="border-r-4 border-neutral-400/50 px-4 italic my-4" {...props} />,

    table: (props) => (
      <div className="my-10 text-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse" {...props} />
      </div>
    ),
    thead: (props) => <thead className="mt-4" {...props} />,
    th: (props) => <th className="px-5 py-4 min-w-36 whitespace-nowrap text-right font-black text-neutral-800 dark:text-neutral-200" {...props} />,
    td: (props) => <td className="px-5 py-3 " {...props} />,
    tr: (props) => <tr className="border-y border-neutral-300 dark:border-neutral-700 last:border-0" {...props} />,

    cite: (props) => <cite className="italic text-neutral-600 dark:text-neutral-400" {...props} />,
    span: (props) => <span {...props} />
  }

  return renderers
}