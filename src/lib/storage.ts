import type { GenerationRecord } from "@/types"

export const KEY_STORAGE = "haze_agnes_api_key"
export const HISTORY_STORAGE = "haze_generation_history"

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
