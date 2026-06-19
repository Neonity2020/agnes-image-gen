import { Copy, Download, LoaderCircle, Wand2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { ConversationEntry } from "@/types"

export function Conversation({ entries, onEditImage }: { entries: ConversationEntry[]; onEditImage: (image: string) => void }) {
  return (
    <div className="mx-auto mt-4 w-full max-w-[820px]" aria-live="polite">
      {entries.map((entry) => (
        <div key={entry.id} className="mb-8 animate-[rise_.4s_ease_both]">
          <div className="mb-6 flex justify-end"><div className="max-w-[min(560px,86%)] rounded-[18px_18px_5px_18px] bg-[#262520] px-4 py-3 text-[13px] leading-relaxed text-white shadow-lg">{entry.prompt}</div></div>
          <div className="mb-3 flex items-center gap-2 text-[13px] text-[#68655f]"><span className="size-4 rotate-45 rounded-[5px] bg-[#e36f3f]" />{entry.status === "loading" ? "Agnes 正在构思" : "Agnes Image 2.1 Flash"}</div>
          {entry.status === "loading" && (
            <div className="grid w-full max-w-[590px] place-items-center rounded-[18px] border border-black/5 bg-[linear-gradient(120deg,#eae5dc_25%,#f5f2ec_40%,#eae5dc_55%)] bg-[length:250%_100%] shadow-sm animate-[shimmer_1.8s_linear_infinite]" style={{ aspectRatio: entry.size.replace("x", " / ") }}>
              <div className="flex flex-col items-center gap-3 text-sm text-[#6e6b65]"><LoaderCircle className="size-8 animate-spin text-[#e36f3f]" />正在生成你的画面...</div>
            </div>
          )}
          {entry.status === "error" && <div className="rounded-[14px] border border-[#be462d]/15 bg-[#fff6f2] px-5 py-4 text-xs leading-relaxed text-[#9e402c]"><strong>暂时无法生成图片</strong><br />{entry.error}</div>}
          {entry.status === "success" && entry.image && (
            <>
              <div className="group relative w-fit max-w-full overflow-hidden rounded-[18px] bg-[#eae6de] shadow-[0_24px_70px_rgba(37,32,22,.11)]">
                <img src={entry.image} alt={entry.prompt} className="block max-h-[62vh] max-w-full object-contain" />
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-100 transition-all md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                  <Button asChild size="icon" className="rounded-[10px] bg-[#1a1916]/80 text-white backdrop-blur hover:bg-black"><a href={entry.image} download={`agnes-image-${entry.created}.png`} aria-label="下载图片"><Download className="size-4" /></a></Button>
                  <Button type="button" size="icon" onClick={() => onEditImage(entry.image!)} className="rounded-[10px] bg-[#1a1916]/80 text-white backdrop-blur hover:bg-black" aria-label="基于此图继续编辑"><Wand2 className="size-4" /></Button>
                  <Button type="button" size="icon" onClick={async () => { await navigator.clipboard.writeText(entry.prompt); toast.success("提示词已复制") }} className="rounded-[10px] bg-[#1a1916]/80 text-white backdrop-blur hover:bg-black" aria-label="复制提示词"><Copy className="size-4" /></Button>
                </div>
              </div>
              <p className="mt-2.5 text-xs text-[#807d76]">{entry.size} · Agnes Image 2.1 Flash</p>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
