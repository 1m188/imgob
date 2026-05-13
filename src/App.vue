<!--
  App.vue — 应用根组件

  职责：
  - 装配所有子组件：FolderSelector、Toolbar、ImageCanvas、ThumbnailStrip
  - 调用 useFolderPicker / useImages / useKeyboard composable
  - 管理全局状态：全屏模式、缩略图可见性
  - 协调子组件间的数据流和事件

  数据流：
  useFolderPicker → useImages.loadFiles() → 分发到各子组件
  Toolbar/TileStrip/ImageCanvas → emit 事件 → 调用 useImages 导航方法

  边缘情况：
  - 文件夹为空 → ImageCanvas 显示占位，ThumbnailStrip 隐藏
  - 单张图片 → 隐藏缩略图条和部分导航 UI
-->
<script setup>
import { ref } from 'vue'
import FolderSelector from './components/FolderSelector.vue'
import Toolbar from './components/Toolbar.vue'
import ImageCanvas from './components/ImageCanvas.vue'
import ThumbnailStrip from './components/ThumbnailStrip.vue'
import { useFolderPicker } from './composables/useFolderPicker.js'
import { useImages } from './composables/useImages.js'
import { useKeyboard } from './composables/useKeyboard.js'

// ---- 状态 ----

/** 全屏模式 */
const isFullscreen = ref(false)
/** 是否显示缩略图条 */
const showThumbnails = ref(true)

// ---- Composables ----

const { files, error, isPicking, pickFolder } = useFolderPicker()
const {
  imageList,
  currentIndex,
  sortMode,
  sortAsc,
  currentImage,
  count,
  loadFiles,
  cleanup: cleanupImages,
  setSortMode,
  toggleSortDirection,
  next,
  prev,
  goFirst,
  goLast,
  goTo,
  markFailed,
  setCustomOrder,
} = useImages()

// ---- 文件夹选取 ----

async function handlePickFolder() {
  await pickFolder()
  if (files.value.length > 0) {
    loadFiles(files.value)
  }
}

/** 拖拽文件夹 */
function handleFilesDropped(droppedFiles) {
  if (droppedFiles.length === 0) return
  // 先清空 useFolderPicker 旧状态
  files.value = droppedFiles
  loadFiles(droppedFiles)
}

// ---- 键盘快捷键 ----

useKeyboard({
  onPrev: prev,
  onNext: next,
  onFirst: goFirst,
  onLast: goLast,
  onToggleFullscreen: toggleFullscreen,
  onToggleThumbnails: () => {
    showThumbnails.value = !showThumbnails.value
  },
  onToggleSort: () => {
    // S 键循环切换排序模式
    const modes = ['name', 'time', 'size']
    const idx = modes.indexOf(sortMode.value)
    const nextMode = modes[(idx + 1) % modes.length]
    setSortMode(nextMode)
  },
})

// ---- 全屏 ----

async function toggleFullscreen() {
  if (isFullscreen.value) {
    await document.exitFullscreen()
  } else {
    await document.documentElement.requestFullscreen()
  }
}

// 监听浏览器 F11 / ESC 退出全屏
document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})

// ---- 缩略图排序 ----

function handleReorder(newOrder) {
  setCustomOrder(newOrder)
}
</script>

<template>
  <div class="app" :class="{ 'app--has-images': count > 0 }">
    <!-- 文件夹选择器（有图片时在 Toolbar 内） -->
    <div v-if="count === 0" class="app__folder-picker">
      <FolderSelector
        :is-picking="isPicking"
        :error="error"
        :image-count="count"
        :has-selection="count > 0"
        @pick-folder="handlePickFolder"
        @files-dropped="handleFilesDropped"
      />
    </div>

    <!-- 工具栏（有图片时显示） -->
    <Toolbar
      v-if="count > 0 && !isFullscreen"
      :current-index="currentIndex"
      :count="count"
      :file-name="currentImage?.name || ''"
      :sort-mode="sortMode"
      :sort-asc="sortAsc"
      :is-fullscreen="isFullscreen"
      :show-thumbnails="showThumbnails"
      @sort-change="setSortMode"
      @toggle-direction="toggleSortDirection"
      @toggle-fullscreen="toggleFullscreen"
      @toggle-thumbnails="showThumbnails = !showThumbnails"
    />

    <!-- 图片展示区 -->
    <ImageCanvas
      :image="currentImage"
      :is-fullscreen="isFullscreen"
      @prev="prev"
      @next="next"
      @toggle-fullscreen="toggleFullscreen"
      @load-error="markFailed(currentIndex)"
    />

    <!-- 底部工具栏（全屏时浮动显示） -->
    <div v-if="count > 0 && isFullscreen" class="app__fullscreen-bar">
      <span class="app__fs-index">{{ currentIndex + 1 }} / {{ count }}</span>
      <span class="app__fs-name">{{ currentImage?.name }}</span>
      <button class="app__fs-exit" @click="toggleFullscreen">退出全屏</button>
    </div>

    <!-- 缩略图条 -->
    <ThumbnailStrip
      v-if="count > 1 && !isFullscreen && showThumbnails"
      :images="imageList"
      :current-index="currentIndex"
      @select="goTo"
      @reorder="handleReorder"
    />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: var(--color-bg);
}

.app__folder-picker {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* === 全屏浮动工具栏 === */
.app__fullscreen-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 42px;
  display: flex;
  align-items: center;
  gap: var(--padding-md);
  padding: 0 var(--padding-md);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1001;
  opacity: 0;
  transition: opacity 0.3s;
}

.app__fullscreen-bar:hover {
  opacity: 1;
}

.app__fs-index {
  font-size: 12px;
  color: var(--color-text-dim);
  font-family: var(--font-mono);
}

.app__fs-name {
  font-size: 12px;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.app__fs-exit {
  padding: 4px 12px;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: var(--color-text);
  transition: background 0.2s;
}

.app__fs-exit:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
