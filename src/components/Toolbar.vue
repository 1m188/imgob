<!--
  Toolbar.vue — 顶部工具栏

  职责：
  - 显示排序模式按钮组（名称 / 时间 / 大小）
  - 显示当前图片索引和总数（如 "3 / 12"）
  - 显示当前文件名
  - 排序升降序切换按钮
  - 全屏按钮
  - 缩略图条显示/隐藏按钮

  排序逻辑由父组件（App.vue）通过 useImages 提供，
  本组件仅负责渲染 UI 和 emit 事件。
-->
<script setup>
import { computed } from 'vue'
import { SORT_MODES } from '../composables/useImages.js'

const props = defineProps({
  /** 当前图片索引（0-based） */
  currentIndex: { type: Number, default: -1 },
  /** 图片总数 */
  count: { type: Number, default: 0 },
  /** 当前文件名 */
  fileName: { type: String, default: '' },
  /** 当前排序模式 */
  sortMode: { type: String, default: 'name' },
  /** 是否升序 */
  sortAsc: { type: Boolean, default: true },
  /** 是否全屏模式 */
  isFullscreen: { type: Boolean, default: false },
  /** 是否显示缩略图条 */
  showThumbnails: { type: Boolean, default: true },
})

const emit = defineEmits([
  'sort-change',
  'toggle-direction',
  'toggle-fullscreen',
  'toggle-thumbnails',
])

/** 排序模式对应的中文标签 */
const sortLabels = {
  name: '按名称',
  time: '按时间',
  size: '按大小',
}

/** 显示的索引文字（如 "3 / 12"） */
const indexText = computed(() => {
  if (props.count === 0) return ''
  return `${props.currentIndex + 1} / ${props.count}`
})
</script>

<template>
  <div class="toolbar">
    <!-- 左侧：排序按钮组 -->
    <div class="toolbar__sort-group">
      <button
        v-for="mode in SORT_MODES"
        :key="mode"
        class="toolbar__sort-btn"
        :class="{ 'toolbar__sort-btn--active': sortMode === mode }"
        @click="emit('sort-change', mode)"
      >
        {{ sortLabels[mode] }}
      </button>
      <button
        class="toolbar__dir-btn"
        :title="sortAsc ? '升序（点击切换降序）' : '降序（点击切换升序）'"
        @click="emit('toggle-direction')"
      >
        {{ sortAsc ? '↑' : '↓' }}
      </button>
    </div>

    <!-- 中间：文件信息 -->
    <div class="toolbar__info">
      <span class="toolbar__index">{{ indexText }}</span>
      <span v-if="fileName" class="toolbar__filename">{{ fileName }}</span>
    </div>

    <!-- 右侧：功能按钮 -->
    <div class="toolbar__actions">
      <!-- 缩略图切换 -->
      <button
        class="toolbar__icon-btn"
        :title="showThumbnails ? '隐藏缩略图 (T)' : '显示缩略图 (T)'"
        @click="emit('toggle-thumbnails')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>

      <!-- 全屏切换 -->
      <button
        class="toolbar__icon-btn"
        :title="isFullscreen ? '退出全屏 (F)' : '全屏 (F)'"
        @click="emit('toggle-fullscreen')"
      >
        <svg v-if="!isFullscreen" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--toolbar-height);
  padding: 0 var(--padding-md);
  background: var(--color-bg-toolbar);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
  gap: var(--padding-sm);
  flex-shrink: 0;
}

/* === 排序按钮组 === */
.toolbar__sort-group {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--color-bg);
  border-radius: 6px;
  padding: 2px;
}

.toolbar__sort-btn {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 4px;
  color: var(--color-text-dim);
  transition: all 0.15s;
}

.toolbar__sort-btn:hover {
  color: var(--color-text);
}

.toolbar__sort-btn--active {
  background: var(--color-accent);
  color: #1a1a1a;
  font-weight: 600;
}

.toolbar__dir-btn {
  padding: 4px 8px;
  font-size: 14px;
  color: var(--color-text-dim);
  border-radius: 4px;
  transition: all 0.15s;
}

.toolbar__dir-btn:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.05);
}

/* === 中间信息 === */
.toolbar__info {
  display: flex;
  align-items: center;
  gap: var(--padding-sm);
  min-width: 0;
  flex: 1;
  justify-content: center;
}

.toolbar__index {
  font-size: 12px;
  color: var(--color-text-dim);
  white-space: nowrap;
  font-family: var(--font-mono);
}

.toolbar__filename {
  font-size: 12px;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

/* === 右侧功能按钮 === */
.toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: var(--color-text-dim);
  transition: all 0.15s;
}

.toolbar__icon-btn:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.08);
}
</style>
