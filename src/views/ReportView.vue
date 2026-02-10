<template>
  <div class="h-full overflow-y-auto p-8 bg-white">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h1 class="text-3xl font-bold text-slate-900">审查报告</h1>
          <p class="text-slate-500 font-medium">详细的文档审查结果与建议</p>
        </div>
        
        <div class="flex items-center space-x-3">
          <button 
            @click="exportReport('pdf')"
            class="px-4 py-2 bg-primary-900 hover:bg-primary-800 text-white font-semibold rounded-lg transition-all shadow-sm flex items-center space-x-2"
          >
            <Download class="w-4 h-4" />
            <span>导出PDF</span>
          </button>
          
          <button 
            @click="startNew"
            class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition-all flex items-center space-x-2"
          >
            <RotateCw class="w-4 h-4" />
            <span>新建审查</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-slate-600 font-medium mt-4">正在加载报告...</p>
      </div>

      <!-- Report Content -->
      <template v-else-if="report">
        <!-- Summary Card -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-8 shadow-sm space-y-4">
          <h2 class="text-xl font-bold text-slate-900">审查概览</h2>
          
          <div class="grid grid-cols-4 gap-4">
            <div class="bg-white border border-slate-200 rounded-lg p-4">
              <p class="text-xs text-slate-500 font-medium mb-1">总问题数</p>
              <p class="text-2xl font-bold text-slate-900">{{ report.total_issues || 0 }}</p>
            </div>
            
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-xs text-red-700 font-medium mb-1">严重问题</p>
              <p class="text-2xl font-bold text-red-900">{{ report.critical_issues || 0 }}</p>
            </div>
            
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-xs text-yellow-700 font-medium mb-1">警告</p>
              <p class="text-2xl font-bold text-yellow-900">{{ report.warnings || 0 }}</p>
            </div>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="text-xs text-blue-700 font-medium mb-1">建议</p>
              <p class="text-2xl font-bold text-blue-900">{{ report.suggestions || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Issues List -->
        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 class="text-xl font-bold text-slate-900">问题列表</h2>
          
          <div v-if="report.issues && report.issues.length > 0" class="space-y-3">
            <div 
              v-for="(issue, index) in report.issues" 
              :key="index"
              class="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all"
              :class="getIssueBorderClass(issue.severity)"
            >
              <div class="flex items-start space-x-3">
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  :class="getIssueIconClass(issue.severity)"
                >
                  <AlertCircle class="w-5 h-5" />
                </div>
                
                <div class="flex-1 space-y-2">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-bold text-slate-900">{{ issue.title }}</h3>
                    <span 
                      class="px-2 py-1 rounded-full text-xs font-semibold"
                      :class="getIssueBadgeClass(issue.severity)"
                    >
                      {{ issue.severity }}
                    </span>
                  </div>
                  
                  <p class="text-sm text-slate-600">{{ issue.description }}</p>
                  
                  <div v-if="issue.location" class="text-xs text-slate-500 font-mono">
                    位置: {{ issue.location }}
                  </div>
                  
                  <div v-if="issue.suggestion" class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <p class="text-xs text-blue-900 font-medium">建议: {{ issue.suggestion }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-slate-400">
            <CheckCircle class="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p class="font-medium">未发现问题，文档质量良好！</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { getReviewResult, exportReport as exportReportAPI } from '../api'
import { Download, RotateCw, AlertCircle, CheckCircle } from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()

const loading = ref(false)
const report = ref(null)

// 获取报告样式类
const getIssueBorderClass = (severity) => {
  const classes = {
    critical: 'border-l-4 border-l-red-500',
    warning: 'border-l-4 border-l-yellow-500',
    info: 'border-l-4 border-l-blue-500',
  }
  return classes[severity] || 'border-l-4 border-l-slate-300'
}

const getIssueIconClass = (severity) => {
  const classes = {
    critical: 'bg-red-100 text-red-600',
    warning: 'bg-yellow-100 text-yellow-600',
    info: 'bg-blue-100 text-blue-600',
  }
  return classes[severity] || 'bg-slate-100 text-slate-600'
}

const getIssueBadgeClass = (severity) => {
  const classes = {
    critical: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
  }
  return classes[severity] || 'bg-slate-100 text-slate-800'
}

// 导出报告
const exportReport = async (format) => {
  if (!store.reviewId) return
  
  try {
    const blob = await exportReportAPI(store.reviewId, format)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `review-report-${store.documentName}.${format}`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export failed:', error)
    alert('导出失败，请重试')
  }
}

// 开始新审查
const startNew = () => {
  store.clearAll()
  router.push('/')
}

// 加载报告
const loadReport = async () => {
  if (!store.reviewId) return
  
  loading.value = true
  try {
    const result = await getReviewResult(store.reviewId)
    report.value = result
  } catch (error) {
    console.error('Failed to load report:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReport()
})
</script>
