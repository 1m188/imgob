<!--
  ThumbnailStrip.vue — 底部缩略图条

  职责：
  - 水平滚动展示所有图片的缩略图
  - 当前图片高亮边框标识
  - 点击缩略图跳转到对应图片
  - 支持 HTML5 Drag & Drop 实现自定义排序
  - 自动滚动到当前图片可见位置

  边缘情况：
  - 单张图片：不显示缩略图条（由父组件控制 visible）
  - 拖拽排序后：排序模式自动切换为 custom
  - 缩略图加载失败：显示灰色占位符
  - 大量图片（>500 张）性能：暂不做虚拟滚动
-->
<script setup>
import { ref, watch, nextTick, computed } from 'vue'

const props = defineProps({
  /** 图片项列表 */
  images: { type: Array, default: () => [] },
  /** 当前高亮索引 */
  currentIndex: { type: Number, default: 0 },
})

const emit = defineEmits(['select', 'reorder'])

/** 缩略图容器 ref（用于滚动控制） */
const stripRef = ref(null)
/** 当前拖拽项的索引 */
const dragIndex = ref(-1)
/** 拖拽悬停目标索引 */
const dragOverIndex = ref(-1)

/** 是否应该显示缩略图条 */
const shouldShow = computed(() => props.images.length > 1)

/**
 * 自动滚动使当前索引的缩略图可见
 */
function scrollToCurrent() {
  if (!stripRef.value) return

  const thumb = stripRef.value.children[currentIndex.value]
  if (thumb) {
    thumb.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }
}

watch(
  () => props.currentIndex,
  () => {
    nextTick(scrollToCurrent)
  },
)

// --- Drag & Drop 排序 ---

function handleDragStart(e, index) {
  dragIndex.value = index
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', index.toString())
  // 设置拖拽图像为缩略图自身
  if (e.target.tagName === 'IMG') {
    e.dataTransfer.setDragImage(e.target, 40, 40)
  }
}

function handleDragOver(e, index) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  dragOverIndex.value = index
}

function handleDragLeave() {
  dragOverIndex.value = -1
}

function handleDrop(e, dropIndex) {
  e.preventDefault()
  const fromIndex = dragIndex.value
  dragIndex.value = -1
  dragOverIndex.value = -1

  if (fromIndex < 0 || fromIndex === dropIndex) return

  const newList = [...props.images]
  const [moved] = newList.splice(fromIndex, 1)
  newList.splice(dropIndex, 0, moved)

  emit('reorder', newList)
}

function handleDragEnd() {
  dragIndex.value = -1
  dragOverIndex.value = -1
}

/** 缩略图加载失败：用灰色占位块替换 */
function onThumbError(e) {
  e.target.style.display = 'none'
  const placeholder = e.target.nextElementSibling
  if (placeholder) {
    placeholder.style.display = 'flex'
  }
}
</script>

<template>
  <div
    v-if="shouldShow"
    ref="stripRef"
    class="thumbnail-strip"
  >
    <div
      v-for="(img, index) in images"
      :key="index"
      class="thumbnail-strip__item"
      :class="{
        'thumbnail-strip__item--active': index === currentIndex,
        'thumbnail-strip__item--dragging': index === dragIndex,
        'thumbnail-strip__item--dragover': index === dragOverIndex,
      }"
      draggable="true"
      @click="emit('select', index)"
      @dragstart="handleDragStart($event, index)"
      @dragover="handleDragOver($event, index)"
      @dragleave="handleDragLeave"
      @drop="handleDrop($event, index)"
      @dragend="handleDragEnd"
    >
      <img
        :src="img.url"
        :alt="img.name"
        class="thumbnail-strip__img"
        :title="img.name"
        @error="onThumbError"
      />
      <!-- 加载失败占位 -->
      <div class="thumbnail-strip__placeholder" style="display: none">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.thumbnail-strip {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  height: var(--thumb-strip-height);
  padding: var(--padding-sm) var(--padding-md);
  background: var(--color-bg-thumb);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top: 1px solid var(--color-border);
  overflow-x: auto;
  overflow-y: hidden;
  flex-shrink: 0;
  z-index: 99;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.thumbnail-strip::-webkit-scrollbar {
  height: 4px;
}

.thumbnail-strip::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.thumbnail-strip__item {
  position: relative;
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}

.thumbnail-strip__item:hover {
  border-color: var(--color-thumb-hover);
}

.thumbnail-strip__item--active {
  border-color: var(--color-thumb-active) !important;
  box-shadow: 0 0 6px var(--color-thumb-active-shadow);
}

.thumbnail-strip__item--dragging {
  opacity: 0.4;
}

.thumbnail-strip__item--dragover {
  border-color: var(--color-accent);
  transform: scale(1.1);
}

.thumbnail-strip__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.thumbnail-strip__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  color: var(--color-text-dim);
}

/* === 移动端缩略图高度 === */
@media (max-width: 768px) {
  .thumbnail-strip {
    height: var(--thumb-strip-mobile-height);
    padding: 4px var(--padding-sm);
  }

  .thumbnail-strip__item {
    width: 44px;
    height: 44px;
  }
}
</style>
