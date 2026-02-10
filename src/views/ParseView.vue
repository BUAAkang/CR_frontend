<template>
  <div class="h-full overflow-y-auto p-8 bg-white">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold text-slate-900">文档解析</h1>
        <p class="text-slate-500 font-medium">正在解析文档内容，提取关键信息</p>
      </div>

      <!-- Parse Status Card -->
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-8 shadow-sm">
        <div v-if="parsing" class="text-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p class="text-slate-600 font-medium">正在解析文档...</p>
        </div>

        <div v-else-if="parseResult" class="space-y-6">
          <div class="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center space-x-3">
              <CheckCircle class="w-8 h-8 text-green-600" />
              <div>
                <p class="text-sm font-bold text-green-900">解析完成</p>
                <p class="text-xs text-green-700">文档已成功解析</p>
              </div>
            </div>
          </div>

          <!-- Parse Result Display -->
          <div class="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h3 class="text-lg font-bold text-slate-900">解析结果</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-xs text-slate-500 font-medium">文档类型</p>
                <p class="text-sm font-semibold text-slate-900">{{ parseResult.document_type || '未知' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-xs text-slate-500 font-medium">页面数</p>
                <p class="text-sm font-semibold text-slate-900">{{ parseResult.page_count || 0 }} 页</p>
              </div>
              <div class="space-y-1">
                <p class="text-xs text-slate-500 font-medium">字数统计</p>
                <p class="text-sm font-semibold text-slate-900">{{ parseResult.word_count || 0 }} 字</p>
              </div>
              <div class="space-y-1">
                <p class="text-xs text-slate-500 font-medium">章节数</p>
                <p class="text-sm font-semibold text-slate-900">{{ parseResult.section_count || 0 }} 个</p>
              </div>
            </div>

            <!-- Parsed Content Preview -->
            <div class="space-y-2">
              <p class="text-xs text-slate-500 font-medium">内容预览</p>
              <div class="bg-slate-50 border border-slate-200 rounded p-4 max-h-64 overflow-y-auto">
                <pre class="text-xs text-slate-700 whitespace-pre-wrap font-mono">{{ parseResult.content_preview || '无预览内容' }}</pre>
              </div>
            </div>
          </div>

          <button 
            @click="goToReview"
            class="w-full py-3 bg-primary-900 hover:bg-primary-800 text-white font-bold rounded-lg transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <CheckCircle class="w-5 h-5" />
            <span>开始审查分析</span>
          </button>
        </div>

        <div v-else class="text-center space-y-4">
          <button 
            @click="startParsing"
            class="px-6 py-3 bg-primary-900 hover:bg-primary-800 text-white font-bold rounded-lg transition-all shadow-md"
          >
            开始解析
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { parseDocument, getParseResult } from '../api'
import { CheckCircle } from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()

const parsing = ref(false)
const parseResult = ref(null)

// 开始解析
const startParsing = async () => {
  if (!store.documentId) return
  
  parsing.value = true
  try {
    const response = await parseDocument(store.documentId)
    const parseId = response.parse_id
    
    // 轮询获取解析结果
    await pollParseResult(parseId)
    
    store.setParse(parseId)
  } catch (error) {
    console.error('Parse failed:', error)
    alert('解析失败，请重试')
  } finally {
    parsing.value = false
  }
}

// 轮询解析结果
const pollParseResult = async (parseId) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const result = await getParseResult(parseId)
        
        if (result.status === 'completed') {
          parseResult.value = result
          clearInterval(interval)
          resolve(result)
        } else if (result.status === 'failed') {
          clearInterval(interval)
          reject(new Error('解析失败'))
        }
      } catch (error) {
        clearInterval(interval)
        reject(error)
      }
    }, 2000)
  })
}

// 跳转到审查页面
const goToReview = () => {
  router.push('/review')
}

// 如果已有解析结果，直接加载
onMounted(async () => {
  if (store.parseId) {
    try {
      const result = await getParseResult(store.parseId)
      parseResult.value = result
    } catch (error) {
      console.error('Failed to load parse result:', error)
    }
  }
})
</script>
