import { ArrowUpRight, Check, ChevronRight, Eye, EyeOff } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type SettingsDialogProps = {
  open: boolean
  apiKey: string
  onOpenChange: (open: boolean) => void
  onSave: (value: string) => void
  onClear: () => void
}

export function SettingsDialog({ open, apiKey, onOpenChange, onSave, onClear }: SettingsDialogProps) {
  const [value, setValue] = useState(apiKey)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setValue(apiKey)
      setVisible(false)
    }
  }, [apiKey, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="pr-12">
          <p className="text-[13px] font-semibold uppercase tracking-[1.3px] text-[#7e7b74]">连接 Agnes</p>
          <DialogTitle>配置 API Key</DialogTitle>
          <DialogDescription className="pt-2 text-[14px] leading-relaxed text-[#68655f]">你的 Key 只会保存在当前浏览器的 localStorage 中，并直接用于请求 Agnes API。</DialogDescription>
        </DialogHeader>

        <Button asChild variant="outline" className="h-auto justify-start rounded-xl border-[#e36f3f]/20 bg-[#e36f3f]/[.065] px-3 py-3 text-[#5f514a] shadow-none hover:-translate-y-px hover:bg-[#e36f3f]/10">
          <a href="https://platform.agnes-ai.com/settings/apiKeys" target="_blank" rel="noopener noreferrer">
            <span className="grid size-8 place-items-center rounded-[9px] bg-[#e36f3f] text-white"><ArrowUpRight className="size-4" /></span>
            <span className="flex flex-col items-start gap-0.5"><strong className="text-[13px]">前往 Agnes 平台获取 Key</strong><small className="text-[11px] font-normal text-[#8b7770]">打开 API Keys 设置页面</small></span>
            <ChevronRight className="ml-auto size-5 text-[#aa7664]" />
          </a>
        </Button>

        <form onSubmit={(event) => { event.preventDefault(); onSave(value.trim()) }} className="space-y-3">
          <label htmlFor="apiKey" className="block text-[13px] font-semibold text-[#56534e]">Agnes API Key</label>
          <div className="relative">
            <Input id="apiKey" type={visible ? "text" : "password"} value={value} onChange={(event) => setValue(event.target.value)} placeholder="sk-..." autoComplete="off" autoFocus className="h-12 rounded-xl bg-white pr-20 text-sm" />
            <Button type="button" variant="ghost" onClick={() => setVisible((current) => !current)} className="absolute right-1 top-1 h-10 px-3 text-xs text-[#6b6862]" aria-label="显示或隐藏 API Key">
              {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}{visible ? "隐藏" : "显示"}
            </Button>
          </div>
          <div className="flex items-center gap-2.5 rounded-[10px] bg-[#f0eee8] p-3">
            <span className="grid size-6 place-items-center rounded-lg bg-[#dde9df] text-[#66846d]"><Check className="size-3.5" /></span>
            <span className="flex flex-col"><strong className="text-[13px]">本地存储</strong><small className="text-[11px] text-[#7d7972]">不会上传到任何第三方服务器</small></span>
          </div>
          <DialogFooter className="pt-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={onClear} className="text-[#a85c49]">清除 Key</Button>
            <Button type="submit" className="bg-[#1d1d1b] text-white hover:bg-black">保存并继续</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
