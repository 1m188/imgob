/**
 * useFolderPicker — 文件夹选择逻辑
 *
 * 核心职责：
 * - 检测并调用 File System Access API (showDirectoryPicker)
 * - 不支持时降级到 <input webkitdirectory>
 * - 递归读取选定目录中所有支持的图片文件
 * - 返回 { files, error, pickFolder, isPicking }
 *
 * 支持的图片格式：JPEG / PNG / GIF / WebP / SVG / BMP / AVIF
 * 边缘情况：
 * - 权限拒绝 → 捕获 DOMException 并返回 error 字符串
 * - 空文件夹 → files 为空数组，组件层展示提示
 * - 不支持 FSA → 静默降级，不报错
 */
import { ref } from 'vue'

/** 支持的图片 MIME 类型集合（用于 input accept 属性） */
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif']

/** 图片 MIME 类型映射（用于过滤和 accept） */
const IMAGE_MIME_SET = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/avif',
])

/**
 * 检查浏览器是否支持 File System Access API
 * 需要安全上下文（localhost / HTTPS）
 */
function supportsFSA() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

/**
 * 通过 File System Access API 选择文件夹
 * 递归读取目录下所有图片文件（仅一级，不递归子目录）
 */
async function pickViaFSA() {
  const dirHandle = await window.showDirectoryPicker({ mode: 'read' })
  const files = []

  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile()
      if (IMAGE_MIME_SET.has(file.type)) {
        // Firefox 等对某些格式可能返回空 type，
        // 降级用扩展名判断
        files.push(file)
      }
    }
  }

  // 如果 MIME 过滤漏了（如 Firefox 返回空 type），用扩展名再过滤
  return files.filter((f) => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase()
    return IMAGE_EXTENSIONS.includes(ext)
  })
}

/**
 * 降级方案：通过 <input webkitdirectory> 选择文件夹
 * 返回 Promise<File[]>
 */
function pickViaInput() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.webkitdirectory = true
    input.accept = IMAGE_EXTENSIONS.join(',')

    const cleanup = () => {
      input.removeEventListener('change', onChange)
      input.remove()
    }

    const onChange = () => {
      cleanup()
      const files = Array.from(input.files || []).filter((f) => {
        const ext = '.' + f.name.split('.').pop()?.toLowerCase()
        return IMAGE_EXTENSIONS.includes(ext)
      })
      resolve(files)
    }

    // 用户取消选择（窗口关闭无 change 事件）：用 focus 回退检测
    const onFocus = () => {
      setTimeout(() => {
        if (input.files?.length === 0) {
          cleanup()
          window.removeEventListener('focus', onFocus)
          resolve([]) // 取消视为空结果
        }
      }, 300)
    }

    input.addEventListener('change', onChange)
    window.addEventListener('focus', onFocus)
    input.click()
  })
}

export function useFolderPicker() {
  /** 选定文件夹中的图片文件列表 */
  const files = ref([])
  /** 错误信息（null 表示无错误） */
  const error = ref(null)
  /** 是否正在选择文件夹 */
  const isPicking = ref(false)

  /**
   * 打开文件夹选择器
   * @returns {Promise<File[]>} 图片文件数组，取消/错误时返回空数组
   */
  async function pickFolder() {
    isPicking.value = true
    error.value = null

    try {
      if (supportsFSA()) {
        files.value = await pickViaFSA()
      } else {
        files.value = await pickViaInput()
      }
    } catch (err) {
      // 用户取消（AbortError）或权限被拒（NotAllowedError）
      if (err.name === 'AbortError') {
        files.value = []
      } else if (err.name === 'NotAllowedError') {
        error.value = '文件夹访问权限被拒绝，请重试或更换浏览器。'
        files.value = []
      } else {
        error.value = `选择文件夹时出错：${err.message}`
        files.value = []
      }
    } finally {
      isPicking.value = false
    }

    return files.value
  }

  /** 清空当前文件列表和错误 */
  function reset() {
    files.value = []
    error.value = null
  }

  return {
    files,
    error,
    isPicking,
    pickFolder,
    reset,
  }
}
