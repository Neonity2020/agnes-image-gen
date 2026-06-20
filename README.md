# Agnes Agent

一个使用 LangGraph.js 编排 Agnes 模型的浏览器端多模态 Agent，支持文生文、文生图、图生图和文生视频。基于 Vite 8、React、TypeScript、Tailwind CSS v4 和 shadcn/ui 构建。

## Agent 图

```text
START -> route -> write   -> END
               -> draw    -> END
               -> animate -> END
```

模型可以通过环境变量配置：

```bash
VITE_AGNES_API_BASE=https://apihub.agnes-ai.com/v1
VITE_AGNES_TEXT_MODEL=agnes-2.0-flash
VITE_AGNES_IMAGE_MODEL=agnes-image-2.1-flash
VITE_AGNES_VIDEO_MODEL=agnes-video-v2.0
```

## 运行

安装依赖并启动开发服务器：

```bash
npm install
npm run dev
```

构建生产版本：

```bash
npm run build
```

## Netlify 部署

该项目是纯静态网站，可直接连接 GitHub 仓库部署：

- Build command：`npm run build`
- Publish directory：`dist`

仓库中的 `netlify.toml` 已包含发布目录和基础安全响应头配置。

## 数据与隐私

- API Key 存储在浏览器 `localStorage` 的 `haze_agnes_api_key` 键中。
- 请求由浏览器直接发送到 Agnes API，不经过自建服务端。
- 最近生成记录同样只保存在本地浏览器中。

API 文档：https://agnes-ai.com/doc/agnes-image-21-flash
