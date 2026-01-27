import { Lightbulb, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/app/_ui/components/button'
import { websiteName } from '@/app/_text/common'

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void
  suggestions: string[]
}

export function WelcomeScreen({ onSuggestionClick, suggestions }: WelcomeScreenProps) {
  const defaultSuggestions = [
    'حقوق مستاجر و موجر در قرارداد اجاره چگونه است؟',
    'چگونه می‌توان شکایت کلاهبرداری تنظیم کرد؟',
    'روش اعتراض به رأی دادگاه چیست؟',
    'چگونه می‌توان ادعای خسارت ناشی از قرارداد را مطرح کرد؟'
  ]

  const displaySuggestions = (suggestions && suggestions.length > 0) ? suggestions : defaultSuggestions

  return (
    <div className="flex flex-col items-center justify-center w-full text-center px-3 my-auto">
      {/* <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="size-20 mb-5 flex items-center justify-center"
      >
        <img src="/logo.png" alt="لوگو هلثا" className="size-full" />
      </motion.div> */}
      <h3 className="text-xl md:text-3xl font-semibold text-foreground mb-5">
        سوال حقوقی خود را از {websiteName} بپرسید
      </h3>
      <div className="w-full max-w-2xl">
        <h4 className="text-sm font-medium mb-8 flex items-center justify-center gap-1">
          <Lightbulb className="size-4" />
          یا با یکی از سوالات پرتکرار شروع کنید
        </h4>
        <div className="grid grid-cols-1 overflow-hidden">
          {displaySuggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion + index}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, delay: index * 0.3 }}
              className="relative"
            >
              <Button
                variant="ghost"
                className="w-full border-0 h-auto py-4 px-3 text-xs whitespace-normal text-right justify-start cursor-pointer"
                onClick={() => onSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>

              {index !== displaySuggestions.length - 1 && (
                <div className="absolute bottom-0 left-1 right-1 h-px bg-neutral-400/25" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}