import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/_ui/components/dialog"
import { Input } from "@/app/_ui/components/input"
import { Button } from "@/app/_ui/components/button"

export function OrgSubscriptionDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [orgName, setOrgName] = useState("")
  const [count, setCount] = useState<number | undefined>()
  const [contactName, setContactName] = useState("")
  const [contactRole, setContactRole] = useState("")
  const [contactPhone, setContactPhone] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ orgName, count, contactName, contactRole, contactPhone })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>درخواست اشتراک سازمانی</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-5 px-4 -mb-4">
          <Input
            type="text"
            placeholder="نام سازمان"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />
          <Input
            type="number"
            placeholder="تعداد اشتراک مورد نیاز"
            value={count ?? ""}
            onChange={(e) => setCount(e.target.value ? Number(e.target.value) : undefined)}
            required
          />
          <Input
            type="text"
            placeholder="نام پیگیری‌کننده"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="سمت پیگیری‌کننده"
            value={contactRole}
            onChange={(e) => setContactRole(e.target.value)}
            required
          />
          <Input
            type="tel"
            placeholder="شماره تماس پیگیری‌کننده"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            required
            dir="rtl"
          />

          <DialogFooter className="p-0 pt-3">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              لغو
            </Button>
            <Button type="submit">ارسال</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}