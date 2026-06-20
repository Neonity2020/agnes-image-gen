import { ChevronRight, Command, FileText, Image, Menu, Plus, Trash2, Video, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { GenerationRecord } from "@/types"

type AppSidebarProps = {
  open: boolean
  apiConfigured: boolean
  history: GenerationRecord[]
  logo: string
  onClose: () => void
  onNewChat: () => void
  onOpenSettings: () => void
  onSelectHistory: (item: GenerationRecord) => void
  onDeleteHistory: (id: string) => void
}

function relativeTime(timestamp: number) {
  const delta = Date.now() - timestamp
  if (delta < 60_000) return "刚刚"
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)} 分钟前`
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)} 小时前`
  return new Date(timestamp).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
}

export function AppSidebar({ open, apiConfigured, history, logo, onClose, onNewChat, onOpenSettings, onSelectHistory, onDeleteHistory }: AppSidebarProps) {
  const HistoryIcon = ({ mode }: { mode: GenerationRecord["mode"] }) => mode === "text" ? <FileText className="size-4" /> : mode === "video" ? <Video className="size-4" /> : <Image className="size-4" />
  return (
    <>
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-[272px] -translate-x-full flex-col border-r border-black/10 bg-[#efede7]/90 p-[25px_18px_18px] backdrop-blur-2xl transition-transform duration-200 md:relative md:translate-x-0", open && "translate-x-0")}>
        <div className="flex items-center justify-between px-[7px]">
          <a href="#" aria-label="Agnes Agent 首页" className="inline-flex items-center gap-3 text-[19px] font-semibold tracking-[-.4px] text-[#1d1d1b] no-underline">
            <img src={logo} alt="" className="size-8 rounded-[9px] object-cover shadow-md" />
            <span>Agnes Agent</span>
          </a>
          <Button type="button" variant="outline" size="icon" onClick={onClose} className="md:hidden" aria-label="关闭侧栏"><X className="size-4" /></Button>
        </div>

        <Button type="button" variant="outline" onClick={onNewChat} className="mt-7 h-13 justify-start rounded-[13px] bg-white/50 px-3 text-[15px] shadow-none hover:-translate-y-px hover:bg-white hover:shadow-lg">
          <Plus className="size-5" />
          <span>新的创作</span>
          <kbd className="ml-auto rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-normal text-[#85827a]">⌘ K</kbd>
        </Button>

        <nav className="mt-8 min-h-0 flex-1 px-1" aria-label="生成历史">
          <p className="text-[13px] font-semibold uppercase tracking-[1.3px] text-[#7e7b74]">最近创作</p>
          {history.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-[13px] text-[#8f8c84]">
              <span className="size-6 rounded-full border border-[#c8c4bb] shadow-[inset_7px_0_0_rgba(255,255,255,.55)]" />
              <p>你的灵感会出现在这里</p>
            </div>
          ) : (
            <ScrollArea className="mt-3 h-[calc(100dvh-330px)]">
              <div className="space-y-1 pr-2">
                {history.map((item) => (
                  <ContextMenu key={item.id}>
                    <ContextMenuTrigger asChild>
                      <button type="button" onClick={() => onSelectHistory(item)} className="flex w-full items-center gap-2.5 rounded-[10px] bg-transparent p-2 text-left outline-none transition-colors hover:bg-white/65 focus-visible:ring-2 focus-visible:ring-ring/30 data-[state=open]:bg-white/65">
                        <span className="grid size-[38px] shrink-0 place-items-center overflow-hidden rounded-[8px] bg-white/70 text-[#77736c]">{item.mode === "image" && item.mediaUrl ? <img src={item.mediaUrl} alt="" className="size-full object-cover" /> : <HistoryIcon mode={item.mode} />}</span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <strong className="truncate text-[14px] font-medium">{item.prompt}</strong>
                          <small className="text-[11px] text-[#85827a]">{relativeTime(item.created)}</small>
                        </span>
                      </button>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onSelect={() => onDeleteHistory(item.id)} className="text-[#be462d] focus:bg-[#be462d]/10 focus:text-[#9e402c]">
                        <Trash2 className="size-4" />
                        删除
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </div>
            </ScrollArea>
          )}
        </nav>

        <div className="border-t border-black/10 px-1 pt-4">
          <button type="button" onClick={onOpenSettings} className="flex w-full items-center gap-3 rounded-[10px] p-2 text-left transition-colors hover:bg-white/60">
            <span className="grid size-8 place-items-center rounded-[9px] border border-black/10"><Command className="size-4" /></span>
            <span className="flex flex-col gap-0.5"><strong className="text-[15px] font-medium">API 设置</strong><small className="text-xs text-[#807d76]">{apiConfigured ? "已安全保存" : "尚未配置"}</small></span>
            <ChevronRight className="ml-auto size-5 text-[#aaa69e]" />
          </button>
          <div className="mt-3 flex items-center gap-2 px-2 text-xs text-[#89867f]"><span className="size-1.5 rounded-full bg-[#8eb69b] shadow-[0_0_0_3px_rgba(142,182,155,.12)]" />Key 仅保存在此设备</div>
        </div>
      </aside>
      <button type="button" aria-label="关闭侧栏" onClick={onClose} className={cn("fixed inset-0 z-30 bg-black/20 opacity-0 pointer-events-none transition-opacity md:hidden", open && "pointer-events-auto opacity-100")} />
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return <Button type="button" variant="outline" size="icon" onClick={onClick} className="md:hidden" aria-label="打开侧栏"><Menu className="size-4" /></Button>
}
