import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/app/_ui/components/button"
import CompanyInfo from "@/app/_ui/companyInfo"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed w-screen inset-0 z-50 flex items-center justify-center p-8">
          <motion.div
            className="absolute inset-0 bg-black"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: .75 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .3 }}
          />

          <motion.div
            className="relative max-w-md w-full bg-white dark:bg-neutral-700 rounded-3xl overflow-hidden p-6 text-right z-10"
            initial={{ opacity: 0, scale: .75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: .75 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-2 -mt-2">
              <Button
                variant="ghost"
                onClick={onClose}
                className="p-1 -mr-2 size-8 rounded-full"
              >
                <X className="size-5" />
              </Button>
              <h3 className="text-lg font-semibold leading-6">تماس با ما</h3>
            </div>

            <CompanyInfo showDescription={false} />

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
