# Agnes Image Gen

一个使用 Agnes Image 2.1 Flash 的浏览器端 AI 生图应用。

## 运行

项目不需要安装依赖。在项目目录启动任意静态文件服务器：

```bash
python3 -m http.server 4173
```

然后访问 `http://localhost:4173`。

## 数据与隐私

- API Key 存储在浏览器 `localStorage` 的 `haze_agnes_api_key` 键中。
- 请求由浏览器直接发送到 Agnes API，不经过自建服务端。
- 最近生成记录同样只保存在本地浏览器中。

API 文档：https://agnes-ai.com/doc/agnes-image-21-flash
