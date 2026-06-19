export type GenerationRecord = {
  id: string
  prompt: string
  size: string
  image: string
  created: number
}

export type ConversationEntry = {
  id: string
  prompt: string
  size: string
  created: number
  status: "loading" | "success" | "error"
  image?: string
  error?: string
}

export type PromptSuggestion = {
  title: string
  subtitle: string
  prompt: string
  image: string
}
