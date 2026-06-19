const API_ENDPOINT = "https://apihub.agnes-ai.com/v1/images/generations";
const MODEL = "agnes-image-2.1-flash";
const KEY_STORAGE = "haze_agnes_api_key";
const HISTORY_STORAGE = "haze_generation_history";

const $ = (selector) => document.querySelector(selector);
const elements = {
  form: $("#promptForm"),
  prompt: $("#promptInput"),
  size: $("#sizeSelect"),
  send: $("#sendButton"),
  intro: $("#intro"),
  conversation: $("#conversation"),
  workspace: $("#workspace"),
  history: $("#historyList"),
  emptyHistory: $("#emptyHistory"),
  modal: $("#settingsModal"),
  settingsForm: $("#settingsForm"),
  keyInput: $("#apiKeyInput"),
  keyStatus: $("#keyStatus"),
  topKeyLabel: $("#topKeyLabel"),
  topSettings: $("#topSettings"),
  toast: $("#toast"),
  sidebar: $("#sidebar"),
  backdrop: $("#sidebarBackdrop"),
};

let isGenerating = false;
let history = readHistory();
let toastTimer;

function readHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_STORAGE) || "[]");
    return Array.isArray(saved) ? saved.slice(0, 12) : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem(HISTORY_STORAGE, JSON.stringify(history.slice(0, 12)));
  } catch {
    showToast("历史记录空间已满，图片仍可正常使用");
  }
}

function getApiKey() {
  return localStorage.getItem(KEY_STORAGE)?.trim() || "";
}

function updateKeyState() {
  const configured = Boolean(getApiKey());
  elements.keyStatus.textContent = configured ? "已安全保存" : "尚未配置";
  elements.topKeyLabel.textContent = configured ? "API 已连接" : "设置 API Key";
  elements.topSettings.classList.toggle("configured", configured);
}

function showSettings() {
  elements.keyInput.value = getApiKey();
  elements.keyInput.type = "password";
  $("#toggleKey").textContent = "显示";
  elements.modal.showModal();
  requestAnimationFrame(() => elements.keyInput.focus());
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[char]);
}

function relativeTime(timestamp) {
  const delta = Date.now() - timestamp;
  if (delta < 60_000) return "刚刚";
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)} 分钟前`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)} 小时前`;
  return new Date(timestamp).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

function renderHistory() {
  elements.history.innerHTML = "";
  elements.emptyHistory.classList.toggle("hidden", history.length > 0);
  history.forEach((item) => {
    const button = document.createElement("button");
    button.className = "history-item";
    button.type = "button";
    button.innerHTML = `
      <img class="history-thumb" src="${item.image}" alt="" />
      <span class="history-text">
        <strong>${escapeHtml(item.prompt)}</strong>
        <small>${relativeTime(item.created)}</small>
      </span>`;
    button.addEventListener("click", () => showHistoryItem(item));
    elements.history.appendChild(button);
  });
}

function startConversation() {
  elements.intro.classList.add("hidden");
  elements.conversation.classList.remove("hidden");
}

function resetConversation() {
  if (isGenerating) return;
  elements.conversation.innerHTML = "";
  elements.conversation.classList.add("hidden");
  elements.intro.classList.remove("hidden");
  elements.prompt.value = "";
  resizeTextarea();
  elements.prompt.focus();
  closeSidebar();
}

function appendUserMessage(prompt) {
  const message = document.createElement("div");
  message.className = "message user-message";
  message.innerHTML = `<div class="user-bubble">${escapeHtml(prompt)}</div>`;
  elements.conversation.appendChild(message);
}

function appendLoadingMessage(size) {
  const message = document.createElement("div");
  message.className = "message assistant-message";
  message.dataset.loading = "true";
  message.innerHTML = `
    <div class="assistant-label"><span class="mini-gem"></span>Agnes 正在构思</div>
    <div class="generating-card" style="aspect-ratio:${size.replace("x", "/")}">
      <div class="generating-core"><span class="pulse-mark"></span><span>正在生成你的画面...</span></div>
    </div>`;
  elements.conversation.appendChild(message);
  scrollToBottom();
  return message;
}

function resultMarkup(image, prompt, size, created = Date.now()) {
  return `
    <div class="assistant-label"><span class="mini-gem"></span>Agnes Image 2.1 Flash</div>
    <div class="result-card">
      <img src="${image}" alt="${escapeHtml(prompt)}" />
      <div class="result-actions">
        <a class="result-action" href="${image}" download="agnes-image-${created}.png" title="下载图片" aria-label="下载图片">↓</a>
        <button class="result-action copy-prompt" type="button" title="复制提示词" aria-label="复制提示词">⌘</button>
      </div>
    </div>
    <p class="generation-meta">${size} · Agnes Image 2.1 Flash</p>`;
}

function bindResultActions(container, prompt) {
  container.querySelector(".copy-prompt")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(prompt);
    showToast("提示词已复制");
  });
}

function showHistoryItem(item) {
  if (isGenerating) return;
  startConversation();
  elements.conversation.innerHTML = "";
  appendUserMessage(item.prompt);
  const result = document.createElement("div");
  result.className = "message assistant-message";
  result.innerHTML = resultMarkup(item.image, item.prompt, item.size, item.created);
  elements.conversation.appendChild(result);
  bindResultActions(result, item.prompt);
  closeSidebar();
  scrollToBottom();
}

function showError(container, error) {
  const message = normalizeError(error);
  container.innerHTML = `
    <div class="assistant-label"><span class="mini-gem"></span>生成未完成</div>
    <div class="error-card"><strong>暂时无法生成图片</strong><br />${escapeHtml(message)}</div>`;
}

function normalizeError(error) {
  if (error?.name === "AbortError") return "请求时间较长并已超时，请稍后重试。";
  if (error instanceof TypeError) return "无法连接 Agnes API。请检查网络，或确认该 API 允许浏览器跨域请求。";
  return error?.message || "发生未知错误，请稍后再试。";
}

function imageFromResponse(payload) {
  const result = payload?.data?.[0];
  if (result?.url) return result.url;
  if (result?.b64_json) return `data:image/png;base64,${result.b64_json}`;
  const detail = payload?.error?.message || payload?.message;
  throw new Error(detail || "API 没有返回可用的图片数据。");
}

async function generateImage(prompt, size, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 360_000);
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
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error?.message || payload?.message || `请求失败（HTTP ${response.status}）`);
    }
    return imageFromResponse(payload);
  } finally {
    clearTimeout(timeout);
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  const prompt = elements.prompt.value.trim();
  const apiKey = getApiKey();
  if (!prompt || isGenerating) return;
  if (!apiKey) {
    showSettings();
    showToast("请先配置 Agnes API Key");
    return;
  }

  const size = elements.size.value;
  startConversation();
  appendUserMessage(prompt);
  const pending = appendLoadingMessage(size);
  elements.prompt.value = "";
  resizeTextarea();
  setGenerating(true);

  try {
    const image = await generateImage(prompt, size, apiKey);
    const created = Date.now();
    pending.innerHTML = resultMarkup(image, prompt, size, created);
    pending.removeAttribute("data-loading");
    bindResultActions(pending, prompt);
    history.unshift({ id: crypto.randomUUID(), prompt, size, image, created });
    history = history.slice(0, 12);
    saveHistory();
    renderHistory();
  } catch (error) {
    showError(pending, error);
  } finally {
    setGenerating(false);
    scrollToBottom();
    elements.prompt.focus();
  }
}

function setGenerating(value) {
  isGenerating = value;
  elements.send.disabled = value;
  elements.send.classList.toggle("loading", value);
  elements.prompt.disabled = value;
}

function resizeTextarea() {
  elements.prompt.style.height = "auto";
  elements.prompt.style.height = `${Math.min(elements.prompt.scrollHeight, 130)}px`;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    elements.workspace.scrollTop = elements.workspace.scrollHeight;
  });
}

function closeSidebar() {
  elements.sidebar.classList.remove("open");
  elements.backdrop.classList.remove("open");
}

elements.form.addEventListener("submit", handleSubmit);
elements.prompt.addEventListener("input", resizeTextarea);
elements.prompt.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    elements.form.requestSubmit();
  }
});

$("#suggestions").addEventListener("click", (event) => {
  const suggestion = event.target.closest(".suggestion");
  if (!suggestion) return;
  elements.prompt.value = suggestion.dataset.prompt;
  resizeTextarea();
  elements.prompt.focus();
});

$("#openSettings").addEventListener("click", showSettings);
$("#topSettings").addEventListener("click", showSettings);
$("#closeSettings").addEventListener("click", () => elements.modal.close());
$("#newChatButton").addEventListener("click", resetConversation);
$("#openSidebar").addEventListener("click", () => {
  elements.sidebar.classList.add("open");
  elements.backdrop.classList.add("open");
});
$("#closeSidebar").addEventListener("click", closeSidebar);
elements.backdrop.addEventListener("click", closeSidebar);

$("#toggleKey").addEventListener("click", () => {
  const hidden = elements.keyInput.type === "password";
  elements.keyInput.type = hidden ? "text" : "password";
  $("#toggleKey").textContent = hidden ? "隐藏" : "显示";
});

elements.settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const key = elements.keyInput.value.trim();
  if (!key) {
    showToast("请输入有效的 API Key");
    return;
  }
  localStorage.setItem(KEY_STORAGE, key);
  updateKeyState();
  elements.modal.close();
  showToast("API Key 已保存在本地");
  elements.prompt.focus();
});

$("#clearKey").addEventListener("click", () => {
  localStorage.removeItem(KEY_STORAGE);
  elements.keyInput.value = "";
  updateKeyState();
  showToast("API Key 已清除");
});

window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    resetConversation();
  }
});

updateKeyState();
renderHistory();
resizeTextarea();
