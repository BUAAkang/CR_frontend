import { createRouter, createWebHashHistory } from 'vue-router'
import UploadView from '../views/UploadView.vue'
import ParseView from '../views/ParseView.vue'
import ReviewView from '../views/ReviewView.vue'
import ReportView from '../views/ReportView.vue'

const routes = [
  {
    path: '/',
    name: 'upload',
    component: UploadView,
    meta: { title: '文档上传' }
  },
  {
    path: '/documents/:documentId/parse',
    name: 'parse',
    component: ParseView,
    meta: { title: '需求分析' },
    beforeEnter: (to, from, next) => {
      // 验证 documentId 参数是否存在
      if (!to.params.documentId) {
        next('/')
      } else {
        next()
      }
    }
  },
  {
    path: '/documents/:documentId/parse/:parseId/review',
    name: 'review',
    component: ReviewView,
    meta: { title: '需求补全' },
    beforeEnter: (to, from, next) => {
      // 验证必需参数是否存在
      if (!to.params.documentId || !to.params.parseId) {
        next('/')
      } else {
        next()
      }
    }
  },
  {
    path: '/documents/:documentId/parse/:parseId/review/:reviewId/report',
    name: 'report',
    component: ReportView,
    meta: { title: '需求导出' },
    beforeEnter: (to, from, next) => {
      // 验证必需参数是否存在
      if (!to.params.documentId || !to.params.parseId || !to.params.reviewId) {
        next('/')
      } else {
        next()
      }
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 全局路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 文档审查系统` : '文档审查系统'
  next()
})

export default router
