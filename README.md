# imgob

本地图片浏览器 — Vue 3 + Vite 重构版。

## 功能

- 📁 选择本地文件夹（或拖拽到页面）
- 🔀 多种排序：按名称、时间、大小，支持拖拽自定义排序
- 🌗 主题切换：黑夜模式 / 白天模式 / 跟随系统
- ⌨️ 键盘快捷键：← → 翻页，Home/End 首尾，F 全屏，T 缩略图，S 切换排序模式
- 🖼 图片自动适配窗口，保持原始比例
- 📱 移动端触摸手势支持

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

## 部署到 GitHub Pages

```bash
# 构建（需设置 NODE_ENV=production 以注入正确的 base 路径）
NODE_ENV=production npm run build

# 将构建产物复制到 docs/ 目录
cp -r dist/* docs/

# 提交并推送
git add docs/ && git commit -m "Deploy" && git push
```

Pages 配置：Repository Settings → Pages → Source: Deploy from a branch → Branch: master, Folder: /docs。

## 浏览器兼容性

- Chrome/Edge ≥86：完整支持（File System Access API + 拖拽）
- Firefox：降级至 `<input webkitdirectory>`（需手动点击按钮）
- Safari：降级至 `<input webkitdirectory>`

## 技术栈

Vue 3 (Composition API) + Vite
