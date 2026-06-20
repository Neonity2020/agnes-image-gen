import { KeyRound } from "lucide-react"
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import futureCity from "../assets/future-city.webp"
import logo from "../assets/haze-logo.png"
import liveGirl from "../assets/live-girl.webp"
import orangeCat from "../assets/orange-cat.webp"
import { AppSidebar, MobileMenuButton } from "@/components/app-sidebar"
import { Conversation } from "@/components/conversation"
import { PromptComposer } from "@/components/prompt-composer"
import { SettingsDialog } from "@/components/settings-dialog"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { WelcomePanel } from "@/components/welcome-panel"
import { normalizeGenerationError } from "@/lib/agnes"
import { clearApiKey, clearConversation, readApiKey, readConversation, readHistory, removeHistoryItem, writeApiKey, writeConversation, writeHistory } from "@/lib/storage"
import type { ChatMessage, ConversationEntry, GenerationMode, GenerationRecord, PromptSuggestion } from "@/types"

const suggestions: PromptSuggestion[] = [
  {
    title: "云上未来城",
    subtitle: "电影感 · 建筑概念",
    prompt: "一座漂浮在云海上的未来城市，清晨金色阳光，电影感，丰富的建筑细节，广角构图",
    image: futureCity,
  },
  {
    title: "博学的橘猫",
    subtitle: "插画 · 温暖叙事",
    prompt: "一只坐在老式图书馆里的橘猫，戴着圆框眼镜，温暖柔和的灯光，精致故事书插画风格",
    image: orangeCat,
  },
  {
    title: "静谧生活人像",
    subtitle: "摄影 · 温馨生活感",
    prompt: "生活快照风，近景特写，浅色系柔和配色，侧光拍摄，冷白皮年轻长发女子，自然妆容，上围饱满，杏色单肩系带长裙，长款耳饰，户外有翠绿植物，背景是带卷帘的田园房间，内有木质矮桌，人物与绿植、中式元素呼应，静谧雅致，温馨生活感，发丝清晰，裙装垂坠感，画面真实细腻，高画质，光影富有生活气息",
    image: liveGirl,
  },
]

function App() {
  const [apiKey, setApiKey] = useState(readApiKey)
  const [history, setHistory] = useState<GenerationRecord[]>(readHistory)
  const [entries, setEntries] = useState<ConversationEntry[]>(readConversation)
  const [prompt, setPrompt] = useState("")
  const [mode, setMode] = useState<GenerationMode>("image")
  const [size, setSize] = useState("1024x1024")
  const [loading, setLoading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const workspaceRef = useRef<HTMLElement>(null)

  const focusPrompt = useCallback(() => {
    window.requestAnimationFrame(() => textareaRef.current?.focus())
  }, [])

  const resetConversation = useCallback(() => {
    if (loading) {
      toast.info("图片生成完成后即可开始新的创作")
      return
    }
    setEntries([])
    clearConversation()
    setPrompt("")
    setSidebarOpen(false)
    setReferenceImage(null)
    focusPrompt()
  }, [focusPrompt, loading])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        resetConversation()
      }
    }
    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [resetConversation])

  useEffect(() => {
    window.requestAnimationFrame(() => {
      if (workspaceRef.current) workspaceRef.current.scrollTop = workspaceRef.current.scrollHeight
    })
  }, [entries])

  const selectSuggestion = (value: string) => {
    setPrompt(value)
    focusPrompt()
  }

  // Begin an img2img edit: seed the composer with the chosen image as reference.
  const selectEditImage = (image: string) => {
    setMode("image")
    setReferenceImage(image)
    focusPrompt()
  }

  const removeReferenceImage = () => setReferenceImage(null)

  const selectHistory = (item: GenerationRecord) => {
    if (loading) return
    const next: ConversationEntry[] = [{ ...item, status: "success" }]
    setEntries(next)
    if (item.mode === "text") writeConversation(next)
    else clearConversation()
    setSidebarOpen(false)
  }

  const deleteHistory = (id: string) => {
    setHistory((current) => {
      const next = current.filter((item) => item.id !== id)
      removeHistoryItem(id)
      return next
    })
    toast.success("已删除该创作")
  }

  const saveKey = (value: string) => {
    if (!value) {
      toast.error("请输入有效的 API Key")
      return
    }
    writeApiKey(value)
    setApiKey(value)
    setSettingsOpen(false)
    toast.success("API Key 已保存在本地")
    focusPrompt()
  }

  const removeKey = () => {
    clearApiKey()
    setApiKey("")
    toast.success("API Key 已清除")
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanPrompt = prompt.trim()
    if (!cleanPrompt || loading) return
    if (!apiKey) {
      setSettingsOpen(true)
      toast.info("请先配置 Agnes API Key")
      return
    }

    const history: ChatMessage[] = entries
      .filter((entry) => entry.status === "success" && entry.mode === "text" && entry.text)
      .slice(-10)
      .flatMap((entry) => [
        { role: "user" as const, content: entry.prompt },
        { role: "assistant" as const, content: entry.text! },
      ])
    const id = crypto.randomUUID()
    const created = Date.now()
    const pending: ConversationEntry = { id, prompt: cleanPrompt, mode, size: mode === "text" ? undefined : size, created, status: "loading" }
    setEntries((current) => [...current, pending])
    setPrompt("")
    const editingImage = referenceImage
    setReferenceImage(null)
    setLoading(true)

    try {
      const { runAgnesAgent } = await import("@/lib/agent")
      const result = await runAgnesAgent({ prompt: cleanPrompt, mode, size, apiKey, history, referenceImage: mode === "image" ? editingImage ?? undefined : undefined })
      const record: GenerationRecord = { id, prompt: cleanPrompt, mode, size: mode === "text" ? undefined : size, text: result.text, mediaUrl: result.mediaUrl, created }
      setEntries((current) => {
        const next = current.map((entry) => entry.id === id ? { ...entry, text: result.text, mediaUrl: result.mediaUrl, status: "success" as const } : entry)
        try {
          writeConversation(next)
        } catch {
          toast.warning("对话记忆空间已满，本轮对话仍可继续")
        }
        return next
      })
      setHistory((current) => {
        const next = [record, ...current].slice(0, 12)
        try {
          writeHistory(next)
        } catch {
          toast.warning("历史记录空间已满，图片仍可正常使用")
        }
        return next
      })
    } catch (error) {
      const message = normalizeGenerationError(error)
      setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, status: "error", error: message } : entry))
    } finally {
      setLoading(false)
      focusPrompt()
    }
  }

  return (
    <div className="relative h-dvh overflow-hidden bg-[#f8f7f3] text-[#1d1d1b]">
      <div className="relative grid h-dvh grid-cols-1 md:grid-cols-[272px_1fr]">
        <AppSidebar
          open={sidebarOpen}
          apiConfigured={Boolean(apiKey)}
          history={history}
          logo={logo}
          onClose={() => setSidebarOpen(false)}
          onNewChat={resetConversation}
          onOpenSettings={() => setSettingsOpen(true)}
          onSelectHistory={selectHistory}
          onDeleteHistory={deleteHistory}
        />

        <main className="relative flex min-h-0 min-w-0 flex-col">
          <header className="flex h-[62px] shrink-0 items-center justify-between border-b border-black/10 px-4 md:h-[72px] md:px-8">
            <MobileMenuButton onClick={() => setSidebarOpen(true)} />
            <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2.5 text-sm font-medium text-[#5d5a55] md:static md:translate-x-0">
              <span className="relative size-4 rotate-45 rounded-[5px] bg-gradient-to-br from-[#eb8556] to-[#d85b32] shadow-[0_3px_10px_rgba(218,93,49,.24)] after:absolute after:inset-1 after:rounded-sm after:bg-white/55" />
              <span className="hidden md:inline">Agnes Agent · LangGraph.js</span>
            </div>
            <Button type="button" variant="outline" onClick={() => setSettingsOpen(true)} className={apiKey ? "rounded-full border-[#568b67]/25 bg-white/50 text-[#567a61]" : "rounded-full bg-white/50 text-[#5f5c56]"} aria-label={apiKey ? "API 已连接" : "设置 API Key"}>
              <KeyRound className="size-4" /><span className="hidden sm:inline">{apiKey ? "API 已连接" : "设置 API Key"}</span>
            </Button>
          </header>

          <section ref={workspaceRef} className="min-h-0 flex-1 overflow-y-auto scroll-smooth px-4 pb-[190px] pt-5 md:px-[clamp(24px,7vw,110px)] md:pt-8">
            {entries.length === 0 ? <WelcomePanel suggestions={suggestions} onSelect={selectSuggestion} /> : <Conversation entries={entries} onEditImage={selectEditImage} />}
          </section>

          <PromptComposer prompt={prompt} mode={mode} size={size} loading={loading} referenceImage={referenceImage} textareaRef={textareaRef} onPromptChange={setPrompt} onModeChange={(nextMode) => { setMode(nextMode); if (nextMode !== "image") setReferenceImage(null) }} onSizeChange={setSize} onRemoveReferenceImage={removeReferenceImage} onSubmit={handleSubmit} />
        </main>
      </div>

      <SettingsDialog open={settingsOpen} apiKey={apiKey} onOpenChange={setSettingsOpen} onSave={saveKey} onClear={removeKey} />
      <Toaster />
    </div>
  )
}

export default App
