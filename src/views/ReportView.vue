<template>
  <div class="h-full overflow-y-auto p-8 bg-white">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h1 class="text-3xl font-bold text-slate-900">需求导出</h1>
          <p class="text-slate-500 font-medium">查看和导出需求树JSON数据</p>
        </div>

        <div class="flex items-center space-x-3">
          <button @click="exportJSON"
            class="px-4 py-2 bg-primary-900 hover:bg-primary-800 text-white font-semibold rounded-lg transition-all shadow-sm flex items-center space-x-2">
            <Download class="w-4 h-4" />
            <span>导出JSON</span>
          </button>

          <button @click="copyToClipboard"
            class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition-all flex items-center space-x-2">
            <Copy class="w-4 h-4" />
            <span>复制</span>
          </button>

          <button @click="startNew"
            class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition-all flex items-center space-x-2">
            <RotateCw class="w-4 h-4" />
            <span>新建审查</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-slate-600 font-medium mt-4">正在加载数据...</p>
      </div>

      <!-- JSON Display -->
      <div v-else class="space-y-4">
        <!-- Statistics Card -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900 mb-4">数据统计</h2>

          <div class="grid grid-cols-4 gap-4">
            <div class="bg-white border border-slate-200 rounded-lg p-4">
              <p class="text-xs text-slate-500 font-medium mb-1">总需求数</p>
              <p class="text-2xl font-bold text-slate-900">{{ totalNodes }}</p>
            </div>

            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <p class="text-xs text-green-700 font-medium mb-1">一级需求</p>
              <p class="text-2xl font-bold text-green-900">{{ level1Count }}</p>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="text-xs text-blue-700 font-medium mb-1">二级需求</p>
              <p class="text-2xl font-bold text-blue-900">{{ level2Count }}</p>
            </div>

            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p class="text-xs text-purple-700 font-medium mb-1">三级需求</p>
              <p class="text-2xl font-bold text-purple-900">{{ level3Count }}</p>
            </div>
          </div>
        </div>

        <!-- JSON Code Display -->
        <div class="bg-slate-900 rounded-xl shadow-lg overflow-hidden">
          <div class="flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-700">
            <div class="flex items-center space-x-2">
              <Code class="w-4 h-4 text-slate-400" />
              <span class="text-sm font-semibold text-slate-300">requirements.json</span>
            </div>
            <span class="text-xs text-slate-400">{{ jsonString.length }} 字符</span>
          </div>

          <div class="p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
            <pre class="text-sm text-slate-100 font-mono leading-relaxed"><code>{{ jsonString }}</code></pre>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start space-x-3">
            <Info class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div class="space-y-1">
              <p class="text-sm font-semibold text-blue-900">数据格式说明</p>
              <p class="text-xs text-blue-700">
                JSON数据包含完整的需求树结构，每个节点包含：id（标识符）、label（标题）、content（内容描述）、
                level（层级）、v_status（验证状态）、e_status（执行状态）、children（子节点数组）。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { getReviewResult } from '../api'
import { Download, RotateCw, Copy, Code, Info, Utensils } from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()

const loading = ref(false)
const requirementTree = ref(null)

// JSON字符串
const jsonString = computed(() => {
  if (!requirementTree.value) return ''
  return JSON.stringify(requirementTree.value, null, 2)
})

// 统计各级需求数量
const countNodesByLevel = (nodes, targetLevel = null) => {
  let count = 0

  const traverse = (nodeList) => {
    for (const node of nodeList) {
      if (targetLevel === null || node.level === targetLevel) {
        count++
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    }
  }

  traverse(nodes)
  return count
}

const totalNodes = computed(() => {
  return requirementTree.value ? countNodesByLevel(requirementTree.value) : 0
})

const level1Count = computed(() => {
  return requirementTree.value ? countNodesByLevel(requirementTree.value, 1) : 0
})

const level2Count = computed(() => {
  return requirementTree.value ? countNodesByLevel(requirementTree.value, 2) : 0
})

const level3Count = computed(() => {
  return requirementTree.value ? countNodesByLevel(requirementTree.value, 3) : 0
})

// 导出JSON
const exportJSON = () => {
  if (!requirementTree.value) return

  try {
    const blob = new Blob([jsonString.value], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `requirements-${store.documentName || 'export'}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export failed:', error)
    alert('导出失败，请重试')
  }
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(jsonString.value)
    alert('已复制到剪贴板')
  } catch (error) {
    console.error('Copy failed:', error)
    alert('复制失败，请重试')
  }
}

// 开始新分析
const startNew = () => {
  store.clearAll()
  router.push('/')
}
const convertValidationResultToRequirementTree = (validation_results) => {
  let parentIdToCildrens = {}
  let idToItem = {}

  for (const item of validation_results) {
    let converted_item = {
      id: item.id,
      label: item.name,
      content: item.reason,
      e_status: item.result ? "pass" : "fail",
      v_status: item.result,
      level:0,
      children: null,
    }
    idToItem[item.id] = converted_item
    if (!(item.parent_id in parentIdToCildrens)) {
      parentIdToCildrens[item.parent_id] = []
    }
    parentIdToCildrens[item.parent_id].push(converted_item)
  }
  for (const id in idToItem) {
    idToItem[id].children = parentIdToCildrens[id]
  }
  const setLevel = (node, level) => {
    node.level = level
    if (node.children) {
      for (const child of node.children) {
        setLevel(child, level + 1)
      }
    }
  }
  const root = parentIdToCildrens["root"][0]
  setLevel(root, 1)

  return [root]
}
// 加载需求树数据
const loadRequirementTree = async () => {
  loading.value = true
  try {
    // 尝试从API加载数据
    if (store.documentId) {
      const result = await getReviewResult(store.documentId)
      let vr = result.validation_results
      let rt = convertValidationResultToRequirementTree(vr)
      requirementTree.value = rt || getMockData()
    } else {
      // 如果没有reviewId，使用模拟数据
      requirementTree.value = getMockData()
    }
  } catch (error) {
    console.error('Failed to load requirement tree:', error)
    // 出错时使用模拟数据
    requirementTree.value = getMockData()
  } finally {
    loading.value = false
  }
}

// 获取模拟数据
const getMockData = () => {
  return [
    {
      id: 'req-1',
      label: '1. 系统概述',
      content: '本系统是一个文档审查工具，用于分析和审查软件需求文档。',
      level: 1,
      v_status: true,
      e_status: 'pass',
      children: [
        {
          id: 'req-1-1',
          label: '1.1 系统目标',
          content: '提供自动化的文档审查能力，提高文档质量。',
          level: 2,
          v_status: true,
          e_status: 'pass',
          children: []
        },
        {
          id: 'req-1-2',
          label: '1.2 应用范围',
          content: '适用于软件开发过程中的需求文档审查。',
          level: 2,
          v_status: true,
          e_status: 'pending',
          children: []
        }
      ]
    },
    {
      id: 'req-2',
      label: '2. 功能需求',
      content: '系统应提供以下功能模块。',
      level: 1,
      v_status: true,
      e_status: 'pass',
      children: [
        {
          id: 'req-2-1',
          label: '2.1 文档上传',
          content: '用户可以上传Word、PDF等格式的文档。',
          level: 2,
          v_status: true,
          e_status: 'pass',
          children: [
            {
              id: 'req-2-1-1',
              label: '2.1.1 支持的格式',
              content: '系统应支持.docx, .pdf, .txt格式的文档上传。',
              level: 3,
              v_status: true,
              e_status: 'pass',
              children: []
            },
            {
              id: 'req-2-1-2',
              label: '2.1.2 文件大小限制',
              content: '单个文件大小不超过50MB。',
              level: 3,
              v_status: false,
              e_status: 'fail',
              children: []
            }
          ]
        },
        {
          id: 'req-2-2',
          label: '2.2 需求分析',
          content: '系统自动解析文档并提取需求结构。',
          level: 2,
          v_status: true,
          e_status: 'pending',
          children: []
        },
        {
          id: 'req-2-3',
          label: '2.3 需求补全',
          content: '对缺失或不完整的需求进行分析和建议。',
          level: 2,
          v_status: false,
          e_status: 'pending',
          children: []
        }
      ]
    },
    {
      id: 'req-3',
      label: '3. 非功能需求',
      content: '系统的性能、安全等非功能性要求。',
      level: 1,
      v_status: true,
      e_status: 'pass',
      children: [
        {
          id: 'req-3-1',
          label: '3.1 性能需求',
          content: '系统响应时间应在3秒以内。',
          level: 2,
          v_status: true,
          e_status: 'pass',
          children: []
        },
        {
          id: 'req-3-2',
          label: '3.2 安全需求',
          content: '用户数据应加密存储和传输。',
          level: 2,
          v_status: true,
          e_status: 'pass',
          children: []
        }
      ]
    }
  ]
}

onMounted(() => {
  loadRequirementTree()
})
</script>
