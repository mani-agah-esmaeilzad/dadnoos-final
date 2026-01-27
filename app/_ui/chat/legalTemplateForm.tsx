import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/app/_ui/components/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/_ui/components/form'
import { Input } from '@/app/_ui/components/input'
import { Textarea } from '@/app/_ui/components/textarea'
import Popup from '@/app/_ui/components/popup'

export interface FormFieldConfig {
  name: string
  label: string
  placeholder: string
  type: 'text' | 'textarea' | 'number'
  validation: z.ZodType<any, any>
}

export interface LegalTemplate {
  title: string
  description: string
  fields: FormFieldConfig[]
}

interface LegalTemplateFormProps {
  template: LegalTemplate
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Record<string, any>) => void
}

export function LegalTemplateForm({ template, isOpen, onClose, onSubmit }: LegalTemplateFormProps) {
  const formSchema = z.object(
    template.fields.reduce((acc, field) => {
      acc[field.name] = field.validation
      return acc
    }, {} as Record<string, z.ZodType<any, any>>)
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: template.fields.reduce((acc, field) => {
      acc[field.name] = ''
      return acc
    }, {} as Record<string, any>),
  })

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values)
    form.reset()
  }

  return (
    <Popup visible={isOpen} onClose={onClose}>
      <div className="max-w-xl w-full -mb-4">
        <h2 className="text-lg font-bold text-center mt-4">{template.title}</h2>
        <p className="text-sm text-center text-neutral-500 mt-1">{template.description}</p>

        <Form {...form}>
          <p className="text-center text-xs text-neutral-300 dark:text-neutral-500 mt-4">
            تکمیل این بخش ها اختیاری است و تکمیل آن ها به تولید پاسخ بهتر کمک می‌کند.
          </p>

          <form onSubmit={form.handleSubmit(handleFormSubmit)} dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto scrollbar pl-4 pr-3 py-4">
              {template.fields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name}
                  render={({ field: formField }) => (
                    <FormItem className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <FormLabel className="text-xs">{field.label}</FormLabel>
                      <FormControl>
                        {field.type === 'textarea' ? (
                          <Textarea placeholder={field.placeholder} {...formField} />
                        ) : (
                          <Input type={field.type} placeholder={field.placeholder} {...formField} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 p-4 border-t border-neutral-400/15">
              <Button type="button" variant="outline" onClick={onClose}>
                لغو
              </Button>
              <Button type="submit">ایجاد پیش‌نویس</Button>
            </div>
          </form>
        </Form>
      </div>
    </Popup>
  )
}
