export type GenerationMode = "text" | "image" | "video"

export type GenerationRecord = {
  id: string
  prompt: string
  mode: GenerationMode
  created: number
  text?: string
  mediaUrl?: string
  size?: string
}

export type ConversationEntry = GenerationRecord & {
  status: "loading" | "success" | "error"
  error?: string
}

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type PromptSuggestion = {
  title: string
  subtitle: string
  prompt: string
  image: string
}
