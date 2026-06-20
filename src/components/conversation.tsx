import { Copy, Download, LoaderCircle, Wand2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { ConversationEntry } from "@/types"

const modeName = { text: "Agnes 2.0 Flash", image: "Agnes Image 2.1 Flash", video: "Agnes Video 2.0" }

export function Conversation({ entries, onEditImage }: { entries: ConversationEntry[]; onEditImage: (image: string) => void }) {
  return <div className="mx-auto mt-4 w-full max-w-[820px]" aria-live="polite">{entries.map((entry) => (
    <div key={entry.id} className="mb-8 animate-[rise_.4s_ease_both]">
      <div className="mb-6 flex justify-end"><div className="max-w-[min(560px,86%)] rounded-[14px_14px_4px_14px] bg-[#262520] px-4 py-3 text-[13px] leading-relaxed text-white shadow-lg">{entry.prompt}</div></div>
      <div className="mb-3 flex items-center gap-2 text-[13px] text-[#68655f]"><span className="size-4 rotate-45 rounded-[4px] bg-[#e36f3f]" />{entry.status === "loading" ? "Agnes Agent 正在处理" : modeName[entry.mode]}</div>
      {entry.status === "loading" && <div className="flex min-h-32 w-full max-w-[590px] items-center justify-center rounded-[8px] border border-black/5 bg-[#eeeae2]"><div className="flex items-center gap-3 text-sm text-[#6e6b65]"><LoaderCircle className="size-5 animate-spin text-[#e36f3f]" />{entry.mode === "text" ? "正在组织文字..." : entry.mode === "video" ? "正在生成视频，这可能需要几分钟..." : "正在生成画面..."}</div></div>}
      {entry.status === "error" && <div className="rounded-[8px] border border-[#be462d]/15 bg-[#fff6f2] px-5 py-4 text-xs leading-relaxed text-[#9e402c]"><strong>暂时无法完成</strong><br />{entry.error}</div>}
      {entry.status === "success" && entry.text && <div className="group relative max-w-[720px] rounded-[8px] border border-black/8 bg-white/55 px-5 py-4 text-[14px] leading-7 text-[#34332f]"><Button type="button" variant="ghost" size="icon" onClick={async () => { await navigator.clipboard.writeText(entry.text!); toast.success("Markdown 已复制") }} className="absolute right-2 top-2 z-10 size-8 opacity-70 hover:opacity-100" aria-label="复制 Markdown"><Copy className="size-4" /></Button><div className="agnes-markdown pr-8"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>, table: ({ children, ...props }) => <div className="markdown-table-wrap"><table {...props}>{children}</table></div> }}>{entry.text}</ReactMarkdown></div></div>}
      {entry.status === "success" && entry.mediaUrl && entry.mode === "image" && <><div className="group relative w-fit max-w-full overflow-hidden rounded-[8px] bg-[#eae6de] shadow-[0_24px_70px_rgba(37,32,22,.11)]"><img src={entry.mediaUrl} alt={entry.prompt} className="block max-h-[62vh] max-w-full object-contain" /><div className="absolute bottom-3 right-3 flex gap-2"><Button asChild size="icon" className="rounded-[8px] bg-[#1a1916]/80 text-white"><a href={entry.mediaUrl} download={`agnes-image-${entry.created}.png`} aria-label="下载图片"><Download className="size-4" /></a></Button><Button type="button" size="icon" onClick={() => onEditImage(entry.mediaUrl!)} className="rounded-[8px] bg-[#1a1916]/80 text-white" aria-label="编辑此图"><Wand2 className="size-4" /></Button></div></div><p className="mt-2.5 text-xs text-[#807d76]">{entry.size} · {modeName.image}</p></>}
      {entry.status === "success" && entry.mediaUrl && entry.mode === "video" && <><div className="max-w-[720px] overflow-hidden rounded-[8px] bg-black shadow-xl"><video src={entry.mediaUrl} controls playsInline className="block max-h-[62vh] w-full" /></div><div className="mt-2.5 flex items-center gap-3 text-xs text-[#807d76]"><span>{entry.size} · {modeName.video}</span><a href={entry.mediaUrl} download={`agnes-video-${entry.created}.mp4`} className="inline-flex items-center gap-1 hover:text-[#e36f3f]"><Download className="size-3.5" />下载</a></div></>}
    </div>
  ))}</div>
}
