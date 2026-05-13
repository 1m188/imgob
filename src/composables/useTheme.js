/**
 * useTheme — 主题模式管理
 *
 * 核心职责：
 * - 管理三种主题模式：dark（黑夜）/ light（白天）/ system（跟随系统）
 * - 持久化到 localStorage（键名：imgob-theme）
 * - 在 <html> 上设置 data-theme 属性驱动 CSS 变量切换
 * - 默认值为 'dark'
 * - system 模式下监听 prefers-color-scheme 媒体查询变化
 *
 * 边缘情况：
 * - localStorage 不可用时静默降级，功能正常但不持久化
 * - 用户手动切换后 system 模式自动断开（不会覆盖手动选择）
 */
import { ref, watch, onMounted } from 'vue'

const STORAGE_KEY = 'imgob-theme'

/** @type {('dark'|'light'|'system')[]} */
export const THEME_MODES = ['dark', 'light', 'system']

/** 从 localStorage 读取持久化主题 */
function loadTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && THEME_MODES.includes(saved)) {
      return saved
    }
  } catch {
    // localStorage 不可用
  }
  return 'dark'
}

/** 持久化主题 */
function saveTheme(mode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // localStorage 不可用
  }
}

/**
 * 解析当前生效的实际主题（system 模式下查询媒体查询）
 * @param {'dark'|'light'|'system'} mode
 * @returns {'dark'|'light'}
 */
function resolveActualTheme(mode) {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  return mode
}

/**
 * 将主题应用到 <html data-theme="...">
 */
function applyThemeToDOM(mode) {
  const actual = resolveActualTheme(mode)
  document.documentElement.setAttribute('data-theme', actual)
}

export function useTheme() {
  const themeMode = ref(loadTheme())

  /** 当前实际生效的主题（dark/light，不含 system） */
  const activeTheme = ref(resolveActualTheme(themeMode.value))

  /** 主题标签映射 */
  const themeLabels = {
    dark: '黑夜模式',
    light: '白天模式',
    system: '跟随系统',
  }

  /** 主题图标映射 */
  const themeIcons = {
    dark: '🌙',
    light: '☀️',
    system: '🖥',
  }

  /**
   * 设置主题模式
   * @param {'dark'|'light'|'system'} mode
   */
  function setTheme(mode) {
    if (!THEME_MODES.includes(mode)) return
    themeMode.value = mode
    activeTheme.value = resolveActualTheme(mode)
    saveTheme(mode)
    applyThemeToDOM(mode)
  }

  /** 循环切换到下一个模式 */
  function cycleTheme() {
    const idx = THEME_MODES.indexOf(themeMode.value)
    const next = THEME_MODES[(idx + 1) % THEME_MODES.length]
    setTheme(next)
  }

  // 初始化：应用主题到 DOM
  onMounted(() => {
    applyThemeToDOM(themeMode.value)
    activeTheme.value = resolveActualTheme(themeMode.value)

    // system 模式下监听系统主题变化
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onSystemChange = () => {
      if (themeMode.value === 'system') {
        activeTheme.value = resolveActualTheme('system')
        applyThemeToDOM('system')
      }
    }
    mq.addEventListener('change', onSystemChange)
  })

  return {
    themeMode,
    activeTheme,
    themeLabels,
    themeIcons,
    setTheme,
    cycleTheme,
  }
}
