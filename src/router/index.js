import { createRouter, createWebHistory } from 'vue-router'
import UploadView from '../views/UploadView.vue'
import ParseView from '../views/ParseView.vue'
import ReviewView from '../views/ReviewView.vue'
import ReportView from '../views/ReportView.vue'
import { useAppStore } from '../store'

const routes = [
  {
    path: '/',
    name: 'upload',
    component: UploadView,
    meta: { title: '文档上传' }
  },
  {
    path: '/parse',
    name: 'parse',
    component: ParseView,
    meta: { title: '文档解析' },
    beforeEnter: (to, from, next) => {
      // 开发模式下跳过守卫检查
      if (import.meta.env.DEV) {
        next()
        return
      }
      const store = useAppStore()
      if (!store.documentId) {
        next('/')
      } else {
        next()
      }
    }
  },
  {
    path: '/review',
    name: 'review',
    component: ReviewView,
    meta: { title: '审查分析' },
    beforeEnter: (to, from, next) => {
      // 开发模式下跳过守卫检查
      if (import.meta.env.DEV) {
        next()
        return
      }
      const store = useAppStore()
      if (!store.documentId) {
        next('/')
      } else if (!store.parseId) {
        next('/parse')
      } else {
        next()
      }
    }
  },
  {
    path: '/report',
    name: 'report',
    component: ReportView,
    meta: { title: '审查报告' },
    beforeEnter: (to, from, next) => {
      // 开发模式下跳过守卫检查
      if (import.meta.env.DEV) {
        next()
        return
      }
      const store = useAppStore()
      if (!store.reviewId) {
        next('/')
      } else {
        next()
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 文档审查系统` : '文档审查系统'
  next()
})

export default router
