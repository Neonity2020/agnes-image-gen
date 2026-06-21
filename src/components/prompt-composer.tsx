import { ArrowUp, Frame, Image, LoaderCircle, MessageSquareText, Video, X } from "lucide-react"
import type { FormEvent, KeyboardEvent, RefObject } from "react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { GenerationMode } from "@/types"

const sizeGroups = [
  { label: "方形", items: [["1024x1024", "1:1 方形"]] },
  { label: "横向", items: [["1024x819", "5:4 横向"], ["1024x768", "4:3 横向"], ["1280x720", "16:9 宽屏"]] },
  { label: "纵向", items: [["819x1024", "4:5 纵向"], ["768x1024", "3:4 纵向"], ["720x1280", "9:16 手机竖屏"]] },
]

const modes = [
  { value: "text" as const, label: "文本", icon: MessageSquareText },
  { value: "image" as const, label: "图片", icon: Image },
  { value: "video" as const, label: "视频", icon: Video },
]

type Props = {
  prompt: string
  mode: GenerationMode
  size: string
  activeTaskCount: number
  maxConcurrentTasks: number
  referenceImage: string | null
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onPromptChange: (value: string) => void
  onModeChange: (value: GenerationMode) => void
  onSizeChange: (value: string) => void
  onRemoveReferenceImage: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function PromptComposer({ prompt, mode, size, activeTaskCount, maxConcurrentTasks, referenceImage, textareaRef, onPromptChange, onModeChange, onSizeChange, onRemoveReferenceImage, onSubmit }: Props) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }
  const placeholder = mode === "text" ? "让 Agnes 写点什么..." : mode === "video" ? "描述你想生成的视频镜头..." : referenceImage ? "描述要改变什么、保留什么..." : "描述你想生成的画面..."

  return (
    <div className="absolute bottom-2.5 left-1/2 z-20 w-[calc(100%-24px)] -translate-x-1/2 md:bottom-[17px] md:w-[min(760px,calc(100%-48px))]">
      <form onSubmit={onSubmit} className="rounded-[16px] border border-black/15 bg-white/95 p-[12px_14px_11px] shadow-[0_18px_65px_rgba(42,36,24,.13),0_2px_8px_rgba(42,36,24,.05)] backdrop-blur-2xl transition focus-within:border-[#e36f3f]/35 focus-within:ring-4 focus-within:ring-[#e36f3f]/[.07]">
        {referenceImage && mode === "image" && (
          <div className="mb-2.5 flex items-center gap-2.5 rounded-[8px] border border-black/10 bg-black/[.025] p-1.5 pr-2.5">
            <img src={referenceImage} alt="参考图" className="size-11 rounded-[6px] object-cover" />
            <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#3a3a36]">已选参考图 · 图生图模式</p>
            <button type="button" onClick={onRemoveReferenceImage} aria-label="移除参考图" className="grid size-7 shrink-0 place-items-center rounded-full text-[#85827b] hover:bg-black/5"><X className="size-4" /></button>
          </div>
        )}
        <Textarea ref={textareaRef} value={prompt} onChange={(event) => onPromptChange(event.target.value)} onKeyDown={handleKeyDown} maxLength={4000} rows={1} placeholder={placeholder} aria-label="创作提示词" className="max-h-[130px] min-h-[35px] field-sizing-content border-0 bg-transparent p-1 text-[14px] leading-relaxed shadow-none focus-visible:border-0 focus-visible:ring-0" />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 items-center rounded-[8px] bg-[#f0eee8] p-1" aria-label="生成模式">
              {modes.map((item) => <button key={item.value} type="button" onClick={() => onModeChange(item.value)} className={cn("flex h-7 items-center gap-1.5 rounded-[6px] px-2 text-xs text-[#716e68] transition", mode === item.value && "bg-white font-medium text-[#262520] shadow-sm")}><item.icon className="size-3.5" />{item.label}</button>)}
            </div>
            {mode !== "text" && (
              <Select value={size} onValueChange={onSizeChange}>
                <SelectTrigger aria-label="生成尺寸" className="h-9 rounded-[8px] px-2.5 text-[13px]"><Frame className="size-4 text-[#85827b]" /><SelectValue /></SelectTrigger>
                <SelectContent>{sizeGroups.map((group, index) => <SelectGroup key={group.label}><SelectLabel>{group.label}</SelectLabel>{group.items.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}{index < sizeGroups.length - 1 && <SelectSeparator />}</SelectGroup>)}</SelectContent>
              </Select>
            )}
          </div>
          <Button type="submit" size="icon" disabled={!prompt.trim() || activeTaskCount >= maxConcurrentTasks} className="size-9 rounded-[8px] bg-[#e36f3f] text-white hover:bg-[#c95228]" aria-label="发送给 Agnes"><ArrowUp className="size-4" /></Button>
        </div>
      </form>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#89867f]">{activeTaskCount > 0 && <><LoaderCircle className="size-3 animate-spin text-[#e36f3f]" /><span>{activeTaskCount} 个任务正在并行处理 ·</span></>}<span>AI 生成内容可能存在偏差，请核对重要信息</span></p>
    </div>
  )
}
