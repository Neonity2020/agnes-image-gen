# Agnes Image Gen

一个使用 Agnes Image 2.1 Flash 的浏览器端 AI 生图应用，基于 Vite 8、React、TypeScript、Tailwind CSS v4 和 shadcn/ui 构建。

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
