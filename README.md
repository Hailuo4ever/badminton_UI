# 羽毛球捡球机 UI 前端演示

这是一个用于承接 Figma 设计稿并制作交互演示的前端项目。

## 技术选型

- React 19
- Vite 8
- TypeScript 6
- ESLint
- pnpm

选择 `React + Vite + TypeScript` 的原因是启动快、结构轻、适合高保真还原 Figma 页面，也方便后续加入设备状态、任务流程、地图、控制台等交互演示。

## 常用命令

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm preview
```

## 当前结构

```text
src/
  App.tsx      # 当前演示入口，后续可替换为真实界面
  App.css      # 页面级样式
  index.css    # 全局样式变量与基础样式
```

## 后续接入设计稿时建议补充

- Figma 文件链接或关键页面截图
- 目标屏幕尺寸和设备比例
- 核心用户流程
- 需要模拟的数据与设备状态
- 是否需要移动端、自适应或触屏模式
