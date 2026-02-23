<template>
  <div class="h-full overflow-y-auto p-8 bg-white">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold text-slate-900">审查分析</h1>
        <p class="text-slate-500 font-medium">执行文档智能审查，检测潜在问题</p>
      </div>

      <!-- Review Configuration Card -->
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">
        <h3 class="text-lg font-bold text-slate-900">审查配置</h3>
        
        <!-- Review Options -->
        <div class="grid grid-cols-2 gap-4">
          <label class="flex items-center space-x-3 p-4 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-primary-500">
            <input type="checkbox" v-model="reviewOptions.checkGrammar" class="w-4 h-4 text-primary-600" />
            <span class="text-sm font-semibold text-slate-700">语法检查</span>
          </label>
          
          <label class="flex items-center space-x-3 p-4 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-primary-500">
            <input type="checkbox" v-model="reviewOptions.checkFormat" class="w-4 h-4 text-primary-600" />
            <span class="text-sm font-semibold text-slate-700">格式规范</span>
          </label>
          
          <label class="flex items-center space-x-3 p-4 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-primary-500">
            <input type="checkbox" v-model="reviewOptions.checkConsistency" class="w-4 h-4 text-primary-600" />
            <span class="text-sm font-semibold text-slate-700">一致性检查</span>
          </label>
          
          <label class="flex items-center space-x-3 p-4 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-primary-500">
            <input type="checkbox" v-model="reviewOptions.checkCompleteness" class="w-4 h-4 text-primary-600" />
            <span class="text-sm font-semibold text-slate-700">完整性检查</span>
          </label>
        </div>

        <button 
          @click="startReview"
          :disabled="reviewing || !hasSelectedOptions"
          class="w-full py-3 bg-primary-900 hover:bg-primary-800 disabled:bg-slate-300 text-white font-bold rounded-lg transition-all shadow-md flex items-center justify-center space-x-2"
        >
          <Play class="w-5 h-5" v-if="!reviewing" />
          <RotateCw class="w-5 h-5 animate-spin" v-else />
          <span>{{ reviewing ? '正在审查...' : '开始审查' }}</span>
        </button>
      </div>

      <!-- Review Progress -->
      <div v-if="reviewing" class="bg-slate-50 border border-slate-200 rounded-xl p-8 shadow-sm">
        <div class="space-y-4">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p class="text-slate-600 font-medium">{{ reviewStatus }}</p>
          </div>
          
          <div class="w-full bg-slate-200 rounded-full h-2">
            <div 
              class="bg-primary-600 h-2 rounded-full transition-all duration-300" 
              :style="{ width: reviewProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Review Complete -->
      <div v-if="reviewComplete" class="bg-green-50 border border-green-200 rounded-xl p-8 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <CheckCircle class="w-12 h-12 text-green-600" />
            <div>
              <p class="text-lg font-bold text-green-900">审查完成</p>
              <p class="text-sm text-green-700">已完成文档审查分析</p>
            </div>
          </div>
          
          <button 
            @click="goToReport"
            class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all shadow-md"
          >
            查看报告
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { reviewDocument, getReviewResult } from '../api'
import { Play, RotateCw, CheckCircle } from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()

const reviewOptions = ref({
  checkGrammar: true,
  checkFormat: true,
  checkConsistency: true,
  checkCompleteness: true,
})

const reviewing = ref(false)
const reviewProgress = ref(0)
const reviewStatus = ref('初始化审查...')
const reviewComplete = ref(false)

// 是否有选中的选项
const hasSelectedOptions = computed(() => {
  return Object.values(reviewOptions.value).some(v => v)
})

// 开始审查
const startReview = async () => {
  if (!store.documentId) return
  
  reviewing.value = true
  reviewProgress.value = 0
  reviewComplete.value = false
  try {
    const response = await reviewDocument(store.documentId, reviewOptions.value)
    const reviewId = store.documentId
    
    // 模拟进度更新
    const statusMessages = [
      '正在分析文档结构...',
      '正在检查语法问题...',
      '正在验证格式规范...',
      '正在检查一致性...',
      '正在生成审查报告...',
    ]
    
    let step = 0
    const progressInterval = setInterval(() => {
      if (reviewProgress.value < 90) {
        reviewProgress.value += 10
        reviewStatus.value = statusMessages[step % statusMessages.length]
        step++
      }
    }, 1000)
    
    // 轮询审查结果
    await pollReviewResult(reviewId)
    
    clearInterval(progressInterval)
    reviewProgress.value = 100
    reviewStatus.value = '审查完成'
    
    store.setReview(reviewId)
    reviewComplete.value = true
    
  } catch (error) {
    console.error('Review failed:', error)
    alert('审查失败，请重试')
  } finally {
    reviewing.value = false
  }
}

// 轮询审查结果
const pollReviewResult = async (reviewId) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const result = await getReviewResult(reviewId)
        
        if (true||result.status === 'completed') {
          clearInterval(interval)
          resolve(result)
        } else if (result.status === 'failed') {
          clearInterval(interval)
          reject(new Error('审查失败'))
        }
      } catch (error) {
        clearInterval(interval)
        reject(error)
      }
    }, 2000)
  })
}

// 跳转到报告页面
const goToReport = () => {
  router.push('report')
}
</script>
