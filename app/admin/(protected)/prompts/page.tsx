import PromptManager, { type PromptViewModel } from '@/app/admin/_components/prompt-manager'
import { listAdminPrompts } from '@/lib/admin/prompts'
import { withDbFallback } from '@/lib/db/fallback'

export const metadata = {
  title: 'مدیریت پرامپت‌ها',
}

function toSerializablePrompt(prompt: PromptViewModel): PromptViewModel {
  return {
    ...prompt,
    createdAt: prompt.createdAt ?? null,
    updatedAt: prompt.updatedAt ?? null,
  }
}

export default async function AdminPromptsPage() {
  const prompts = await withDbFallback(() => listAdminPrompts(), [], 'admin-prompts')
  const serializable = prompts.map((prompt) =>
    toSerializablePrompt({
      slug: prompt.slug,
      name: prompt.name,
      type: prompt.type,
      content: prompt.content,
      model: prompt.model ?? null,
      description: prompt.description ?? null,
      metadata: prompt.metadata ?? null,
      source: prompt.source,
      updatedAt: prompt.updatedAt ? prompt.updatedAt.toISOString() : null,
    })
  )

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-neutral-500">پیکربندی هوش مصنوعی</p>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">مدیریت پرامپت‌ها</h1>
        <p className="text-sm text-neutral-500">
          در این صفحه می‌توانید پرامپت هسته، مسیریاب و ماژول‌ها را مشاهده، ویرایش و در صورت نیاز به نسخه پیش‌فرض بازگردانید.
        </p>
      </div>

      <PromptManager initialPrompts={serializable} />
    </section>
  )
}
