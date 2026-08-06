# Barista Web — Next.js 应用（v7 主线）

唯一保留的前端形态：**Next.js 全功能版**（`web/next-app/`）。单文件 HTML 轻量版（`barista-chat.html`）已于 2026-08-06 移除，只保留 Skill + 本地 exe 两条交付路径。

## 启动（开发）

```bash
cd web/next-app
npm install
npm run dev
```

打开 `http://localhost:3000`。需要 **Node.js 20+**（Next.js 16 运行要求）。

## 启动（生产 / 一键 exe）

```bash
npm run build          # 静态导出到 out/
npm run build:exe      # PyInstaller 打包为 dist/Barista.exe
```

双击 `Barista.exe` → 自动启动内置静态服务器 + 打开浏览器。小白用户零依赖。

## 功能（v7）

- **6 模块工作流**：手冲 / 意式 / 奶咖 / 特调 / SCA / 感官，每个模块独立页面 + 专属咖啡元素主题（V60 滤杯 / 浓缩杯 / 奶泡杯 / 分层杯 / 证书徽章 / 杯测勺）
- **模块化输入**：按模块定制字段（手冲 9 字段含滤纸品牌 / 冰手冲模式；意式含超萃/快萃变压预设；奶咖含牛奶品牌库；特调含茶基底 SOP）
- **我的资料**：多设备 + 按模块口味 + 材料库 11 类 + 7 种强调色预设
- **本地知识库**：聊天「收藏配方」一键入库，自动注入 system prompt 供模型参照
- **苹果味质感**：暖咖啡色板 / hairline 卡片 / Spotlight 聚光 / Dock 磁悬浮 / BlurText 入场

## 目录结构

```
next-app/
  src/
    app/          # 页面入口（page.tsx 路由 viewMode：chat / profile / 模块 ID）
    components/   # Sidebar / ChatView / ModuleView / ProfileView / motion/（react-bits 移植）
    lib/          # modules.ts（模块 schema + 品牌/茶底/SOP 数据）/ system-prompt.ts / store
  launcher/       # server.py（零依赖静态服务器，exe 内嵌）
  scripts/        # build-exe.py（PyInstaller 打包）
```

## 隐私

- API Key / 对话 / 知识库仅存浏览器 `localStorage`，不上传任何服务器。
- 对话直连你配置的 LLM API 端点。
