---
description: 构建生成项目，并将生成内容移动到 docs ，以供 github page 等 page 功能发布使用
---

当运行该命令时，请按照以下步骤操作：
- 如果项目根目录存在 `docs` 文件夹，则将其删除
- 在项目根目录运行 `npm run build` 命令，生成 `dist` 文件夹
- 将 `dist` 文件夹重命名为 `docs`