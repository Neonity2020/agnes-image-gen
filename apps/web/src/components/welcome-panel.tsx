import { Button } from "@/components/ui/button"
import type { PromptSuggestion } from "@/types"

type WelcomePanelProps = {
  suggestions: PromptSuggestion[]
  onSelect: (prompt: string) => void
}

export function WelcomePanel({ suggestions, onSelect }: WelcomePanelProps) {
  return (
    <div className="mx-auto mt-[clamp(22px,8vh,82px)] max-w-[760px] animate-[rise_.65s_ease_both] text-center">
      <div className="intro-mark" aria-hidden="true"><span /><span /><span /></div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[1.8px] text-[#e36f3f]">Agnes 多模态 Agent</p>
      <h1 className="font-serif text-[clamp(37px,5vw,59px)] font-normal leading-[1.11] text-[#1d1d1b]">一句话，生成<br /><em className="font-normal text-[#e36f3f]">文本、图片与视频。</em></h1>
      <p className="mx-auto mt-5 max-w-[500px] text-[13px] leading-7 text-[#827f77]">选择创作模式并描述你的想法，LangGraph Agent 会将任务交给合适的 Agnes 模型。</p>
      <div className="mt-9 grid grid-cols-1 gap-3 md:grid-cols-3">
        {suggestions.map((item) => (
          <Button key={item.title} type="button" variant="outline" onClick={() => onSelect(item.prompt)} className="h-auto min-w-0 justify-start rounded-[14px] bg-white/55 p-2 text-left shadow-none transition-all hover:-translate-y-0.5 hover:border-[#e36f3f]/25 hover:bg-white hover:shadow-xl">
            <img src={item.image} alt="" className="size-[46px] shrink-0 rounded-[10px] object-cover" />
            <span className="flex min-w-0 flex-col items-start gap-1"><strong className="max-w-full truncate text-[14px] font-medium">{item.title}</strong><small className="max-w-full truncate text-xs font-normal text-[#85827b]">{item.subtitle}</small></span>
          </Button>
        ))}
      </div>
    </div>
  )
}
