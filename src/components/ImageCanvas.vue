<!--
  ImageCanvas.vue — 图片展示核心组件

  职责：
  - 使用 <img> + object-fit: contain 展示当前图片
  - 图片居中显示，尽可能占满可用空间，保持原始比例
  - 加载中状态：CSS loading 动画占位
  - 加载失败状态：错误图标 + 文件名
  - 支持左右区域点击导航（左侧=上一张，右侧=下一张）
  - 支持双击切换全屏
  - 支持移动端左右滑动手势

  边缘情况：
  - 无图片时（image 为 null）：显示 "请选择文件夹" 占位
  - 图片加载失败：img.onerror 捕获，显示错误占位符
  - EXIF 方向：CSS image-orientation: from-image 自动处理
-->
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  /** 当前显示的图片项 { url, name } */
  image: { type: Object, default: null },
  /** 是否全屏模式 */
  isFullscreen: { type: Boolean, default: false },
})

const emit = defineEmits(['prev', 'next', 'toggle-fullscreen', 'load-error'])

/** 图片加载状态 */
const loadingState = ref('idle') // 'idle' | 'loading' | 'loaded' | 'error'

/** 触摸起始坐标（用于滑动手势） */
const touchStartX = ref(0)
const touchStartY = ref(0)

// 监听 image 变化，重置加载状态
watch(
  () => props.image?.url,
  (newUrl) => {
    if (newUrl) {
      loadingState.value = 'loading'
    } else {
      loadingState.value = 'idle'
    }
  },
  { immediate: true },
)

function onImageLoad() {
  loadingState.value = 'loaded'
}

function onImageError() {
  loadingState.value = 'error'
  emit('load-error')
}

/** 点击图片区域：根据 X 位置决定上一张/下一张 */
function handleClick(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const xRatio = (e.clientX - rect.left) / rect.width

  if (xRatio < 0.3) {
    emit('prev')
  } else if (xRatio > 0.7) {
    emit('next')
  }
}

/** 双击切换全屏 */
function handleDblClick() {
  emit('toggle-fullscreen')
}

// --- 移动端触摸手势 ---
function handleTouchStart(e) {
  const touch = e.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
}

function handleTouchEnd(e) {
  const touch = e.changedTouches[0]
  const deltaX = touch.clientX - touchStartX.value
  const deltaY = touch.clientY - touchStartY.value

  // 水平滑动距离 > 50px 且大于垂直滑动距离
  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      emit('prev')
    } else {
      emit('next')
    }
  }
}
</script>

<template>
  <div
    class="image-canvas"
    :class="{ 'image-canvas--fullscreen': isFullscreen }"
    @click="handleClick"
    @dblclick="handleDblClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- 无图片占位 -->
    <div v-if="!image" class="image-canvas__placeholder">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <p>请选择包含图片的文件夹</p>
    </div>

    <!-- 加载中 -->
    <div v-else-if="loadingState === 'loading'" class="image-canvas__placeholder">
      <div class="image-canvas__spinner"></div>
      <p class="image-canvas__loading-text">加载中…</p>
    </div>

    <!-- 加载失败 -->
    <div v-else-if="loadingState === 'error'" class="image-canvas__placeholder">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
      <p class="image-canvas__error-name">{{ image?.name || '未知文件' }}</p>
      <p class="image-canvas__error-hint">图片加载失败</p>
    </div>

    <!--
      正常显示图片：使用 absolute 定位使 max-width/max-height 正确
      解析为父容器 .image-canvas 的尺寸，而非图片自身自然尺寸。
      这在 flex 容器中尤其关键 — flex 子元素的百分比 max-height
      会在某些浏览器中解析为图片自身高度，导致溢出。
    -->
    <img
      v-show="loadingState === 'loaded'"
      :src="image?.url"
      :alt="image?.name"
      class="image-canvas__img"
      @load="onImageLoad"
      @error="onImageError"
    />

    <!-- 导航提示（半透明区域指示） -->
    <div v-if="image && loadingState === 'loaded'" class="image-canvas__zones">
      <div class="image-canvas__zone image-canvas__zone--left" title="上一张 (←)">
        <span class="image-canvas__zone-hint">‹</span>
      </div>
      <div class="image-canvas__zone image-canvas__zone--right" title="下一张 (→)">
        <span class="image-canvas__zone-hint">›</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-canvas {
  position: relative;
  flex: 1;
  overflow: hidden;
  background: var(--color-bg);
  user-select: none;
  -webkit-user-select: none;
  min-height: 0;
}

.image-canvas--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #000;
}

/* === 图片：absolute 填满父容器，由 object-fit: contain 负责缩放与居中 === */
.image-canvas__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-orientation: from-image;
  transition: opacity 0.3s ease;
}

/* === 占位符（flex 居中） === */
.image-canvas__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-text-dim);
  font-size: 15px;
}

/* === Loading spinner === */
.image-canvas__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.image-canvas__loading-text {
  font-size: 13px;
}

/* === 错误 === */
.image-canvas__error-name {
  color: var(--color-error);
  font-size: 13px;
  word-break: break-all;
  max-width: 80vw;
  text-align: center;
}

.image-canvas__error-hint {
  font-size: 12px;
  color: var(--color-text-dim);
}

/* === 左右导航区域 === */
.image-canvas__zones {
  position: absolute;
  inset: 0;
  display: flex;
  pointer-events: none;
}

.image-canvas__zone {
  flex: 1;
  display: flex;
  align-items: center;
  pointer-events: auto;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-canvas__zone--left {
  justify-content: flex-start;
  padding-left: 16px;
}

.image-canvas__zone--right {
  justify-content: flex-end;
  padding-right: 16px;
}

.image-canvas__zone:hover {
  opacity: 1;
}

.image-canvas__zone-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 28px;
  transition: background-color 0.2s;
}

.image-canvas__zone:hover .image-canvas__zone-hint {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}
</style>
