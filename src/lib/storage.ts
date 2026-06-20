import type { ConversationEntry, GenerationRecord } from "@/types"

export const KEY_STORAGE = "haze_agnes_api_key"
export const HISTORY_STORAGE = "haze_generation_history"
export const CONVERSATION_STORAGE = "haze_active_conversation"

export function readApiKey() {
  return window.localStorage.getItem(KEY_STORAGE)?.trim() ?? ""
}

export function writeApiKey(value: string) {
  window.localStorage.setItem(KEY_STORAGE, value)
}

export function clearApiKey() {
  window.localStorage.removeItem(KEY_STORAGE)
}

export function readHistory(): GenerationRecord[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(HISTORY_STORAGE) ?? "[]")
    if (!Array.isArray(value)) return []
    return value.slice(0, 12).map((item) => {
      const record = item as GenerationRecord & { image?: string }
      return { ...record, mode: record.mode ?? "image", mediaUrl: record.mediaUrl ?? record.image }
    })
  } catch {
    return []
  }
}

export function writeHistory(history: GenerationRecord[]) {
  window.localStorage.setItem(HISTORY_STORAGE, JSON.stringify(history.slice(0, 12)))
}

export function removeHistoryItem(id: string) {
  window.localStorage.setItem(HISTORY_STORAGE, JSON.stringify(readHistory().filter((item) => item.id !== id)))
}

export function readConversation(): ConversationEntry[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(CONVERSATION_STORAGE) ?? "[]")
    if (!Array.isArray(value)) return []
    return value.slice(-30).filter((item): item is ConversationEntry => {
      if (!item || typeof item !== "object") return false
      const entry = item as Partial<ConversationEntry>
      return entry.status === "success" && entry.mode === "text" && typeof entry.prompt === "string" && typeof entry.text === "string"
    })
  } catch {
    return []
  }
}

export function writeConversation(entries: ConversationEntry[]) {
  const textEntries = entries
    .filter((entry) => entry.status === "success" && entry.mode === "text" && entry.text)
    .slice(-30)
  window.localStorage.setItem(CONVERSATION_STORAGE, JSON.stringify(textEntries))
}

export function clearConversation() {
  window.localStorage.removeItem(CONVERSATION_STORAGE)
}
