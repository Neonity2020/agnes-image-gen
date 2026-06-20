const API_BASE = import.meta.env.VITE_AGNES_API_BASE ?? "https://apihub.agnes-ai.com/v1"
const API_ROOT = API_BASE.replace(/\/v1\/?$/, "")
const TEXT_MODEL = import.meta.env.VITE_AGNES_TEXT_MODEL ?? "agnes-2.0-flash"
const IMAGE_MODEL = import.meta.env.VITE_AGNES_IMAGE_MODEL ?? "agnes-image-2.1-flash"
const VIDEO_MODEL = import.meta.env.VITE_AGNES_VIDEO_MODEL ?? "agnes-video-v2.0"

type ApiPayload = {
  data?: Array<{ url?: string | null; b64_json?: string | null }>
  choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>
  error?: { message?: string }
  message?: string
  id?: string
  task_id?: string
  video_id?: string
  status?: string
  url?: string
  video_url?: string
  output?: { url?: string; video_url?: string }
  remixed_from_video_id?: string
}

function headers(apiKey: string) {
  return { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }
}

async function request(path: string, init: RequestInit, timeoutMs = 360_000) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(path.startsWith("http") ? path : `${API_BASE}${path}`, { ...init, signal: controller.signal })
    const payload = (await response.json().catch(() => ({}))) as ApiPayload
    if (!response.ok) throw new Error(payload.error?.message ?? payload.message ?? `请求失败（HTTP ${response.status}）`)
    return payload
  } finally {
    window.clearTimeout(timeout)
  }
}

function mediaFromResponse(payload: ApiPayload, kind: "image" | "video") {
  const result = payload.data?.[0]
  const url = result?.url ?? payload.remixed_from_video_id ?? payload.video_url ?? payload.url ?? payload.output?.video_url ?? payload.output?.url
  if (url) return url
  if (result?.b64_json) return `data:${kind === "image" ? "image/png" : "video/mp4"};base64,${result.b64_json}`
  return undefined
}

export async function generateText(prompt: string, apiKey: string) {
  const payload = await request("/chat/completions", {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: "You are Agnes, a helpful, accurate, and concise AI assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })
  const content = payload.choices?.[0]?.message?.content
  const text = typeof content === "string" ? content : content?.map((part) => part.text ?? "").join("")
  if (!text) throw new Error(payload.error?.message ?? payload.message ?? "API 没有返回文本内容。")
  return text
}

export async function generateImage(prompt: string, size: string, apiKey: string, referenceImage?: string) {
  const payload = await request("/images/generations", {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt,
      size,
      extra_body: { response_format: "url", ...(referenceImage ? { image: [referenceImage] } : {}) },
    }),
  })
  const image = mediaFromResponse(payload, "image")
  if (!image) throw new Error(payload.error?.message ?? payload.message ?? "API 没有返回可用的图片数据。")
  return image
}

export async function generateVideo(prompt: string, size: string, apiKey: string) {
  const [width, height] = size.split("x").map(Number)
  let payload = await request("/videos", {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      model: VIDEO_MODEL,
      prompt,
      width,
      height,
      num_frames: 121,
      frame_rate: 24,
    }),
  }, 600_000)

  const immediate = mediaFromResponse(payload, "video")
  if (immediate) return immediate

  const videoId = payload.video_id
  const taskId = payload.task_id ?? payload.id
  if (!videoId && !taskId) throw new Error(payload.error?.message ?? payload.message ?? "API 没有返回 video_id 或 task_id。")

  for (let attempt = 0; attempt < 120; attempt += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 5_000))
    const statusUrl = videoId
      ? `${API_ROOT}/agnesapi?video_id=${encodeURIComponent(videoId)}&model_name=${encodeURIComponent(VIDEO_MODEL)}`
      : `${API_BASE}/videos/${encodeURIComponent(taskId!)}`
    payload = await request(statusUrl, { headers: headers(apiKey) }, 30_000)
    const video = mediaFromResponse(payload, "video")
    if (video) return video
    if (["failed", "error", "cancelled"].includes(payload.status?.toLowerCase() ?? "")) {
      throw new Error(payload.error?.message ?? payload.message ?? "视频生成失败。")
    }
  }
  throw new Error("视频生成时间过长，请稍后重试。")
}

export function normalizeGenerationError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") return "请求时间较长并已超时，请稍后重试。"
  if (error instanceof TypeError) return "无法连接 Agnes API。请检查网络，或确认该 API 允许浏览器跨域请求。"
  return error instanceof Error ? error.message : "发生未知错误，请稍后再试。"
}
