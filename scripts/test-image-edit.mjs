// Quick probe for the Agnes /v1/images/edits endpoint.
// Usage: AGNES_API_KEY=xxx node scripts/test-image-edit.mjs
// Quick probe for Agnes image-to-image (img2img).
// img2img uses the SAME /v1/images/generations endpoint, with the input
// image passed inside extra_body.image[] as a URL or Data URI Base64.
// Usage: AGNES_API_KEY=xxx node scripts/test-image-edit.mjs
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ENDPOINT = "https://apihub.agnes-ai.com/v1/images/generations"
const MODEL = "agnes-image-2.1-flash"
const apiKey = process.env.AGNES_API_KEY

if (!apiKey) {
  console.error("Missing AGNES_API_KEY env var.")
  process.exit(1)
}

const imgPath = join(__dirname, "..", "assets", "orange-cat.webp")
const bytes = readFileSync(imgPath)
const dataUri = `data:image/webp;base64,${bytes.toString("base64")}`

const body = {
  model: MODEL,
  prompt: "把这只橘猫的毛色改成奶牛猫的黑白色块，其余构图保持不变",
  size: "1024x1024",
  extra_body: {
    image: [dataUri],
    response_format: "url",
  },
}

console.log("POST", ENDPOINT)
const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
})

console.log("status:", res.status, res.statusText)
const text = await res.text()
console.log("body:", text.slice(0, 1200))
