import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  // ==================== State ====================
  state: () => ({
    // 临时 UI 状态（页面级，不持久化）
    currentStep: 0,
    
    // 用户偏好设置（可选：使用 localStorage 持久化）
    theme: localStorage.getItem('theme') || 'light',
    language: localStorage.getItem('language') || 'zh-CN',
  }),
  
  // ==================== Getters ====================
  getters: {
    // 可以添加一些计算属性
  },
  
  // ==================== Actions ====================
  actions: {
    // 设置主题
    setTheme(theme) {
      this.theme = theme
      localStorage.setItem('theme', theme)
    },
    
    // 设置语言
    setLanguage(language) {
      this.language = language
      localStorage.setItem('language', language)
    },
    
    // 设置当前步骤
    setCurrentStep(step) {
      this.currentStep = step
    }
  }
})

