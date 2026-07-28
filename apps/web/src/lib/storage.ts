import type { Conversation, ConversationEntry, GenerationRecord } from "@/types"

export const KEY_STORAGE = "haze_agnes_api_key"
export const HISTORY_STORAGE = "haze_generation_history"
export const CONVERSATION_STORAGE = "haze_active_conversation"
export const CONVERSATIONS_STORAGE = "haze_conversations"

const MAX_CONVERSATIONS = 30
const MAX_ENTRIES_PER_CONVERSATION = 50

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

function isConversationEntry(value: unknown): value is ConversationEntry {
  if (!value || typeof value !== "object") return false
  const entry = value as Partial<ConversationEntry>
  return typeof entry.id === "string"
    && typeof entry.prompt === "string"
    && typeof entry.created === "number"
    && (entry.mode === "text" || entry.mode === "image" || entry.mode === "video")
    && (entry.status === "loading" || entry.status === "success" || entry.status === "error")
}

function normalizeConversation(value: unknown): Conversation | null {
  if (!value || typeof value !== "object") return null
  const conversation = value as Partial<Conversation>
  if (typeof conversation.id !== "string" || typeof conversation.title !== "string" || typeof conversation.created !== "number" || typeof conversation.updated !== "number" || !Array.isArray(conversation.entries)) return null

  return {
    id: conversation.id,
    title: conversation.title,
    created: conversation.created,
    updated: conversation.updated,
    entries: conversation.entries.filter(isConversationEntry).slice(-MAX_ENTRIES_PER_CONVERSATION),
  }
}

function legacyConversations(): Conversation[] {
  const activeEntries = readConversation()
  const activeIds = new Set(activeEntries.map((entry) => entry.id))
  const activeConversation = activeEntries.length > 0
    ? [{
      id: `legacy-${activeEntries[0].id}`,
      title: activeEntries[0].prompt.slice(0, 48),
      created: activeEntries[0].created,
      updated: activeEntries.at(-1)!.created,
      entries: activeEntries,
    }]
    : []
  const historicalConversations = readHistory()
    .filter((record) => !activeIds.has(record.id))
    .map((record) => ({
      id: `legacy-${record.id}`,
      title: record.prompt.slice(0, 48),
      created: record.created,
      updated: record.created,
      entries: [{ ...record, status: "success" as const }],
    }))

  return [...activeConversation, ...historicalConversations]
    .sort((left, right) => right.updated - left.updated)
    .slice(0, MAX_CONVERSATIONS)
}

export function readConversations(): Conversation[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(CONVERSATIONS_STORAGE) ?? "null")
    if (Array.isArray(value)) {
      return value
        .map(normalizeConversation)
        .filter((conversation): conversation is Conversation => conversation !== null)
        .sort((left, right) => right.updated - left.updated)
        .slice(0, MAX_CONVERSATIONS)
    }
  } catch {
    // Fall through to the legacy storage migration below.
  }
  return legacyConversations()
}

export function writeConversations(conversations: Conversation[]) {
  const value = conversations
    .map((conversation) => ({ ...conversation, entries: conversation.entries.slice(-MAX_ENTRIES_PER_CONVERSATION) }))
    .sort((left, right) => right.updated - left.updated)
    .slice(0, MAX_CONVERSATIONS)
  window.localStorage.setItem(CONVERSATIONS_STORAGE, JSON.stringify(value))
}
