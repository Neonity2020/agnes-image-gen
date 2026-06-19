const API_ENDPOINT = "https://apihub.agnes-ai.com/v1/images/generations"
const MODEL = "agnes-image-2.1-flash"

type AgnesResponse = {
  data?: Array<{ url?: string | null; b64_json?: string | null }>
  error?: { message?: string }
  message?: string
}

function imageFromResponse(payload: AgnesResponse) {
  const result = payload.data?.[0]
  if (result?.url) return result.url
  if (result?.b64_json) return `data:image/png;base64,${result.b64_json}`
  throw new Error(payload.error?.message ?? payload.message ?? "API 没有返回可用的图片数据。")
}

export async function generateImage(prompt: string, size: string, apiKey: string) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 360_000)

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        size,
        extra_body: { response_format: "url" },
      }),
      signal: controller.signal,
    })

    const payload = (await response.json().catch(() => ({}))) as AgnesResponse
    if (!response.ok) {
      throw new Error(payload.error?.message ?? payload.message ?? `请求失败（HTTP ${response.status}）`)
    }
    return imageFromResponse(payload)
  } finally {
    window.clearTimeout(timeout)
  }
}

export function normalizeGenerationError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "请求时间较长并已超时，请稍后重试。"
  }
  if (error instanceof TypeError) {
    return "无法连接 Agnes API。请检查网络，或确认该 API 允许浏览器跨域请求。"
  }
  return error instanceof Error ? error.message : "发生未知错误，请稍后再试。"
}
