import { ArrowUp, Frame, LoaderCircle } from "lucide-react"
import type { FormEvent, KeyboardEvent, RefObject } from "react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const sizeGroups = [
  { label: "方形", items: [["1024x1024", "1:1 方形"]] },
  { label: "横向", items: [["1024x819", "5:4 横向"], ["1024x768", "4:3 横向"], ["1152x768", "3:2 横向"], ["1280x800", "16:10 横向"], ["1280x720", "16:9 宽屏"], ["1344x576", "21:9 超宽屏"]] },
  { label: "纵向", items: [["819x1024", "4:5 纵向"], ["768x1024", "3:4 纵向"], ["768x1152", "2:3 纵向"], ["800x1280", "10:16 纵向"], ["720x1280", "9:16 手机竖屏"]] },
]

type PromptComposerProps = {
  prompt: string
  size: string
  loading: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onPromptChange: (value: string) => void
  onSizeChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function PromptComposer({ prompt, size, loading, textareaRef, onPromptChange, onSizeChange, onSubmit }: PromptComposerProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <div className="absolute bottom-2.5 left-1/2 z-20 w-[calc(100%-24px)] -translate-x-1/2 md:bottom-[17px] md:left-[calc(272px+(100%-272px)/2)] md:w-[min(720px,calc(100%-272px-48px))]">
      <form onSubmit={onSubmit} className="rounded-[19px] border border-black/15 bg-white/90 p-[16px_16px_12px] shadow-[0_18px_65px_rgba(42,36,24,.13),0_2px_8px_rgba(42,36,24,.05)] backdrop-blur-2xl transition focus-within:border-[#e36f3f]/35 focus-within:ring-4 focus-within:ring-[#e36f3f]/[.07]">
        <Textarea ref={textareaRef} value={prompt} onChange={(event) => onPromptChange(event.target.value)} onKeyDown={handleKeyDown} disabled={loading} maxLength={2000} rows={1} placeholder="描述你想生成的画面..." aria-label="图片提示词" className="max-h-[130px] min-h-[29px] field-sizing-content border-0 bg-transparent p-0 text-[14px] leading-relaxed shadow-none focus-visible:border-0 focus-visible:ring-0" />
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Select value={size} onValueChange={onSizeChange}>
              <SelectTrigger aria-label="图片尺寸" className="h-9 rounded-[9px] px-2.5 text-[14px]"><Frame className="size-4 text-[#85827b]" /><SelectValue /></SelectTrigger>
              <SelectContent>
                {sizeGroups.map((group, groupIndex) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.items.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    {groupIndex < sizeGroups.length - 1 && <SelectSeparator />}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <span className="hidden text-xs text-[#85827b] sm:inline">Agnes 2.1 Flash</span>
          </div>
          <Button type="submit" size="icon" disabled={loading || !prompt.trim()} className="size-9 rounded-[11px] bg-[#e36f3f] text-white shadow-[0_6px_16px_rgba(227,111,63,.25)] hover:-translate-y-px hover:bg-[#c95228]" aria-label="生成图片">{loading ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}</Button>
        </div>
      </form>
      <p className="mt-2 text-center text-[11px] text-[#89867f]">AI 生成内容可能存在偏差，请核对重要信息</p>
    </div>
  )
}
