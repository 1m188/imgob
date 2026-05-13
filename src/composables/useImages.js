/**
 * useImages — 图片列表状态管理与排序
 *
 * 核心职责：
 * - 接收 File[]，生成 { file, url, name, size, lastModified } 对象数组
 * - 使用 URL.createObjectURL() 生成 blob URL（比 base64 省内存）
 * - 管理 currentIndex（当前显示图片索引）
 * - 提供排序功能：按名称 / 时间 / 大小 / 自定义
 * - 切换文件夹时 revoke 所有旧 blob URL 防止内存泄漏
 *
 * 边缘情况：
 * - 空列表 → imageList 为空，currentIndex = -1
 * - 损坏图片 → 不在此层处理，由 ImageCanvas 组件捕获 onerror
 * - blob URL 生命周期 → watch source files 变化时自动 revoke
 */
import { ref, computed, watch } from 'vue'

/** @typedef {'name' | 'time' | 'size' | 'custom'} SortMode */
/** @typedef {{ file: File, url: string, name: string, size: number, lastModified: number }} ImageItem */

/** 工具栏可见的排序模式（custom 仅由拖拽触发，不显示为按钮） */
export const SORT_MODES = ['name', 'time', 'size']

/**
 * 使用 localeCompare 进行自然排序（处理数字文件名）
 */
function naturalNameSort(a, b) {
  return a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

/**
 * 按修改时间排序（降序 = 最新的在前）
 */
function timeSort(a, b) {
  return b.lastModified - a.lastModified
}

/**
 * 按文件大小排序（降序 = 最大的在前）
 */
function sizeSort(a, b) {
  return b.size - a.size
}

export function useImages() {
  /** 原始 File 对象列表（排序前的顺序，用于自定义排序重置） */
  const sourceFiles = ref([])
  /** 排序后的图片项列表 */
  const imageList = ref([])
  /** 当前显示图片的索引 */
  const currentIndex = ref(-1)
  /** 当前排序模式 */
  const sortMode = ref('name')
  /** 是否升序（false = 降序） */
  const sortAsc = ref(true)
  /** 错误/未加载完成的图片索引集合 */
  const failedImages = ref(new Set())

  /** 当前展示的图片项 */
  const currentImage = computed(() => {
    if (currentIndex.value < 0 || currentIndex.value >= imageList.value.length) {
      return null
    }
    return imageList.value[currentIndex.value]
  })

  /** 图片总数 */
  const count = computed(() => imageList.value.length)

  /**
   * 清理所有旧的 blob URL 并重置状态
   */
  function cleanup() {
    for (const item of imageList.value) {
      if (item.url) {
        URL.revokeObjectURL(item.url)
      }
    }
    imageList.value = []
    sourceFiles.value = []
    currentIndex.value = -1
    failedImages.value = new Set()
  }

  /**
   * 加载新一批 File[]，生成 blob URL 并应用当前排序
   * @param {File[]} files - 原始文件列表
   */
  function loadFiles(files) {
    cleanup()

    if (!files || files.length === 0) {
      return
    }

    sourceFiles.value = [...files]

    imageList.value = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
    }))

    currentIndex.value = 0
    sortImages()
  }

  /** @returns {ImageItem[]} 当前排序后的列表（用于自定义排序后保存） */
  function getSortedList() {
    return [...imageList.value]
  }

  /** 按自定义顺序设置列表（拖拽排序后调用） */
  function setCustomOrder(items) {
    imageList.value = items
    sortMode.value = 'custom'
    sortAsc.value = true
  }

  /**
   * 按当前 sortMode + sortAsc 排序 imageList
   */
  function sortImages() {
    if (imageList.value.length <= 1) {
      return
    }

    // 自定义排序不执行自动排序逻辑
    if (sortMode.value === 'custom') {
      return
    }

    let sorter

    switch (sortMode.value) {
      case 'time':
        sorter = timeSort
        break
      case 'size':
        sorter = sizeSort
        break
      case 'name':
      default:
        sorter = naturalNameSort
        break
    }

    imageList.value.sort(sorter)

    if (!sortAsc.value) {
      imageList.value.reverse()
    }

    // 排序后重置索引到第一张
    currentIndex.value = 0
  }

  /**
   * 切换排序模式
   * @param {'name'|'time'|'size'} mode
   */
  function setSortMode(mode) {
    if (mode === 'custom') {
      return // 自定义排序只能通过拖拽触发
    }
    sortMode.value = mode
    sortImages()
  }

  /** 切换升序/降序 */
  function toggleSortDirection() {
    sortAsc.value = !sortAsc.value
    sortImages()
  }

  /**
   * 导航到指定索引
   * @param {number} index - 目标索引
   */
  function goTo(index) {
    if (imageList.value.length === 0) {
      return
    }
    if (index < 0) {
      currentIndex.value = imageList.value.length - 1
    } else if (index >= imageList.value.length) {
      currentIndex.value = 0
    } else {
      currentIndex.value = index
    }
  }

  /** 下一张（循环） */
  function next() {
    goTo(currentIndex.value + 1)
  }

  /** 上一张（循环） */
  function prev() {
    goTo(currentIndex.value - 1)
  }

  /** 转到第一张 */
  function goFirst() {
    goTo(0)
  }

  /** 转到最后一张 */
  function goLast() {
    goTo(imageList.value.length - 1)
  }

  /** 标记某张图片加载失败 */
  function markFailed(index) {
    failedImages.value = new Set([...failedImages.value, index])
  }

  /** 清除失败标记 */
  function clearFailed(index) {
    const next = new Set(failedImages.value)
    next.delete(index)
    failedImages.value = next
  }

  return {
    // 状态
    sourceFiles,
    imageList,
    currentIndex,
    sortMode,
    sortAsc,
    failedImages,
    // 计算属性
    currentImage,
    count,
    // 方法
    loadFiles,
    cleanup,
    setSortMode,
    toggleSortDirection,
    goTo,
    next,
    prev,
    goFirst,
    goLast,
    markFailed,
    clearFailed,
    getSortedList,
    setCustomOrder,
  }
}
