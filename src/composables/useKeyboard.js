/**
 * useKeyboard — 键盘快捷键管理
 *
 * 核心职责：
 * - 注册/注销全局键盘事件监听
 * - 支持的快捷键：
 *   ← / → : 上一张 / 下一张
 *   Home / End : 第一张 / 最后一张
 *   F : 切换全屏
 *   T : 切换缩略图条
 *   S : 切换排序模式（循环）
 * - 全屏模式下 ESC 由浏览器处理，不做额外拦截
 *
 * 边缘情况：
 * - 输入框聚焦时不响应快捷键（防止与文字输入冲突）
 * - 组件卸载时自动清理监听器
 */
import { onMounted, onUnmounted } from 'vue'

/**
 * @param {Object} handlers - 快捷键回调函数映射
 * @param {() => void} handlers.onPrev - ← 键回调
 * @param {() => void} handlers.onNext - → 键回调
 * @param {() => void} handlers.onFirst - Home 键回调
 * @param {() => void} handlers.onLast - End 键回调
 * @param {() => void} handlers.onToggleFullscreen - F 键回调
 * @param {() => void} handlers.onToggleThumbnails - T 键回调
 * @param {() => void} handlers.onToggleSort - S 键回调
 */
export function useKeyboard(handlers = {}) {
  const {
    onPrev,
    onNext,
    onFirst,
    onLast,
    onToggleFullscreen,
    onToggleThumbnails,
    onToggleSort,
  } = handlers

  /**
   * 判断焦点当前是否在可编辑元素上
   * 防止在输入框/文本域中触发导航快捷键
   */
  function isEditableTarget(target) {
    const tag = target.tagName
    return (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      target.isContentEditable
    )
  }

  function handleKeyDown(e) {
    // 有修饰键时跳过（如 Ctrl+S 是浏览器保存）
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return
    }

    // 输入框中不处理
    if (isEditableTarget(e.target)) {
      return
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        onPrev?.()
        break
      case 'ArrowRight':
        e.preventDefault()
        onNext?.()
        break
      case 'Home':
        e.preventDefault()
        onFirst?.()
        break
      case 'End':
        e.preventDefault()
        onLast?.()
        break
      case 'f':
      case 'F':
        e.preventDefault()
        onToggleFullscreen?.()
        break
      case 't':
      case 'T':
        e.preventDefault()
        onToggleThumbnails?.()
        break
      case 's':
      case 'S':
        e.preventDefault()
        onToggleSort?.()
        break
      default:
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
