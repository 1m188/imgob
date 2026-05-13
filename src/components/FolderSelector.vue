<!--
  FolderSelector.vue — 文件夹选择入口组件

  职责：
  - 展示"选择文件夹"按钮
  - 文件夹拖拽区域（拖拽文件夹到页面打开）
  - 调用 useFolderPicker 的 pickFolder()
  - 展示选择状态（加载中/错误/空文件夹提示）

  边缘情况：
  - 空文件夹：显示 "未找到图片" 提示
  - API 错误：显示错误信息，提供重试按钮
  - 拖拽非文件夹：静默忽略
-->
<script setup>
import { ref } from 'vue'

const props = defineProps({
  /** 是否正在选择/加载文件夹 */
  isPicking: { type: Boolean, default: false },
  /** 错误信息 */
  error: { type: String, default: null },
  /** 图片数量 */
  imageCount: { type: Number, default: 0 },
  /** 是否已选择文件夹 */
  hasSelection: { type: Boolean, default: false },
})

const emit = defineEmits(['pick-folder', 'files-dropped'])

/** 拖拽悬停状态 */
const isDragOver = ref(false)

function handleDragOver(e) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(e) {
  e.preventDefault()
  isDragOver.value = false

  const items = e.dataTransfer?.items
  if (!items) return

  const files = []
  // 递归收集所有拖拽的文件
  function collect(dtItems) {
    for (const item of dtItems) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry?.()
        if (entry) {
          collectFromEntry(entry, files)
        }
      }
    }
  }

  // 如果是文件夹，遍历其内容
  async function collectFromEntry(entry, target) {
    if (entry.isFile) {
      entry.file((file) => target.push(file))
    } else if (entry.isDirectory) {
      // 只处理一级目录
      const reader = entry.createReader()
      reader.readEntries((entries) => {
        for (const e of entries) {
          collectFromEntry(e, target)
        }
      })
    }
  }

  collect(items)

  // 短延迟等待异步读取完成
  setTimeout(() => {
    if (files.length > 0) {
      emit('files-dropped', files)
    }
  }, 200)
}
</script>

<template>
  <div
    class="folder-selector"
    :class="{ 'folder-selector--drag-over': isDragOver }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- 初始状态：选择文件夹 -->
    <div v-if="!hasSelection" class="folder-selector__initial">
      <div class="folder-selector__icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      </div>
      <p class="folder-selector__text">选择包含图片的文件夹</p>
      <p class="folder-selector__hint">或将文件夹拖拽到此页面</p>
      <button
        class="folder-selector__btn"
        :disabled="isPicking"
        @click="emit('pick-folder')"
      >
        {{ isPicking ? '正在打开…' : '选择文件夹' }}
      </button>
    </div>

    <!-- 已选择文件夹：紧凑模式 -->
    <div v-else class="folder-selector__compact">
      <button
        class="folder-selector__btn folder-selector__btn--small"
        :disabled="isPicking"
        @click="emit('pick-folder')"
        :title="isPicking ? '正在打开…' : '更换文件夹'"
      >
        📁 更换文件夹
      </button>
      <span class="folder-selector__count">{{ imageCount }} 张图片</span>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="folder-selector__error">
      <span>{{ error }}</span>
      <button class="folder-selector__retry" @click="emit('pick-folder')">重试</button>
    </div>
  </div>
</template>

<style scoped>
.folder-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--padding-sm) var(--padding-md);
  min-height: 0;
  transition: background-color 0.2s;
}

.folder-selector--drag-over {
  background-color: var(--color-drag-accent);
  outline: 2px dashed var(--color-accent);
  outline-offset: -4px;
  border-radius: 4px;
}

.folder-selector__initial {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: var(--padding-lg);
}

.folder-selector__icon {
  color: var(--color-text-dim);
  opacity: 0.7;
}

.folder-selector__text {
  font-size: 16px;
  color: var(--color-text);
}

.folder-selector__hint {
  font-size: 12px;
  color: var(--color-text-dim);
}

.folder-selector__btn {
  margin-top: 4px;
  padding: 8px 24px;
  background: var(--color-accent);
  color: var(--color-accent-text);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.folder-selector__btn:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.folder-selector__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.folder-selector__compact {
  display: flex;
  align-items: center;
  gap: var(--padding-md);
}

.folder-selector__btn--small {
  margin-top: 0;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 4px;
}

.folder-selector__count {
  font-size: 13px;
  color: var(--color-text-dim);
}

.folder-selector__error {
  display: flex;
  align-items: center;
  gap: var(--padding-sm);
  padding: 4px var(--padding-md);
  color: var(--color-error);
  font-size: 12px;
}

.folder-selector__retry {
  padding: 2px 8px;
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.2s;
}

.folder-selector__retry:hover {
  background: color-mix(in srgb, var(--color-error) 15%, transparent);
}
</style>
