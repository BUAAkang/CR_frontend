import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  // ==================== State ====================
  state: () => ({
    // 持久化字段（使用 localStorage）
    documentId: localStorage.getItem('documentId') || null,
    documentName: localStorage.getItem('documentName') || null,
    parseId: localStorage.getItem('parseId') || null,
    reviewId: localStorage.getItem('reviewId') || null,
    
    // 临时字段（页面级，不持久化）
    currentStep: 0,
  }),
  
  // ==================== Getters ====================
  getters: {
    hasDocument: (state) => state.documentId !== null,
    hasParsed: (state) => state.parseId !== null,
    hasReviewed: (state) => state.reviewId !== null,
  },
  
  // ==================== Actions ====================
  actions: {
    // 设置文档信息
    setDocument(id, name) {
      this.documentId = id
      this.documentName = name
      localStorage.setItem('documentId', id)
      localStorage.setItem('documentName', name)
      // Reset dependent states
      this.setParse(null)
      this.setReview(null)
    },
    
    // 设置解析结果
    setParse(id) {
      this.parseId = id
      if (id) {
        localStorage.setItem('parseId', id)
      } else {
        localStorage.removeItem('parseId')
      }
      // Reset review when parse changes
      this.setReview(null)
    },
    
    // 设置审查结果
    setReview(id) {
      this.reviewId = id
      if (id) {
        localStorage.setItem('reviewId', id)
      } else {
        localStorage.removeItem('reviewId')
      }
    },
    
    // 清除所有状态
    clearAll() {
      this.documentId = null
      this.documentName = null
      this.parseId = null
      this.reviewId = null
      localStorage.removeItem('documentId')
      localStorage.removeItem('documentName')
      localStorage.removeItem('parseId')
      localStorage.removeItem('reviewId')
    }
  }
})
