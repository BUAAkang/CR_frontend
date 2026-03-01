<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="border-b border-slate-200 px-8 py-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-slate-900">需求分析</h1>
        <p class="text-slate-500 font-medium mt-2">解析文档并提取需求结构树</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden flex">
      <!-- Left: Tree View -->
      <div class="w-1/3 border-r border-slate-200 overflow-y-auto p-6">
        <RequirementTree 
          :loading="loading"
          :tree-data="treeData"
          @node-click="handleNodeClick"
          @load-mock-data="loadMockData"
        />
      </div>

      <!-- Right: Detail View -->
      <div class="flex-1 overflow-y-auto p-8">
        <div v-if="selectedNode" class="max-w-3xl space-y-6">
          <!-- Node Header -->
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <span class="px-2 py-1 bg-primary-100 text-primary-900 text-xs font-semibold rounded">
                Level {{ selectedNode.level }}
              </span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900">{{ selectedNode.label }}</h2>
            <p class="text-xs text-slate-500 font-mono">ID: {{ selectedNode.id }}</p>
          </div>

          <!-- Node Content -->
          <div class="space-y-3">
            <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide">需求内容</h3>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <p class="text-slate-700 leading-relaxed whitespace-pre-wrap">{{ selectedNode.content || '暂无内容描述' }}</p>
            </div>
          </div>

          <!-- Children Info -->
          <div v-if="selectedNode.children && selectedNode.children.length > 0" class="space-y-3">
            <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide">子需求</h3>
            <div class="grid grid-cols-2 gap-3">
              <div 
                v-for="child in selectedNode.children" 
                :key="child.id"
                @click="selectNode(child)"
                class="p-4 bg-white border border-slate-200 rounded-lg hover:border-primary-400 hover:shadow-md transition-all cursor-pointer"
              >
                <p class="text-sm font-semibold text-slate-900 mb-1">{{ child.label }}</p>
                <p class="text-xs text-slate-500">{{ child.id }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex items-center justify-center h-full text-slate-400">
          <div class="text-center">
            <FileText class="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p class="text-sm">请从左侧选择需求节点</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div class="border-t border-slate-200 px-8 py-4 bg-slate-50">
      <div class="max-w-7xl mx-auto flex justify-end">
        <button 
          @click="goToNext"
          class="px-6 py-2.5 bg-primary-900 hover:bg-primary-800 text-white font-bold rounded-lg transition-all shadow-sm flex items-center space-x-2"
        >
          <span>进入需求验证</span>
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getParseResult } from '../api'
import { FileText, ChevronRight } from 'lucide-vue-next'
import RequirementTree from '../components/RequirementTree.vue'

const router = useRouter()
const route = useRoute()

// 从 URL 获取 documentId 和 documentName
const documentId = computed(() => route.params.documentId)
const documentName = computed(() => route.query.docName || '未命名文档')

const loading = ref(false)
const requirementTree = ref(null)
const selectedNode = ref(null)

// JSON 转 Element Plus Tree 数据格式
// 由于我们的数据结构已经符合 Element Plus 的要求（有 label 和 children 字段）
// 这个函数主要用于确保数据格式的一致性和处理可能的边界情况
const convertToTreeData = (jsonData) => {
  if (!jsonData || !Array.isArray(jsonData)) {
    return []
  }
  
  // 递归转换函数
  const transformNode = (node) => {
    const transformed = {
      id: node.id,
      label: node.label || '未命名节点',
      content: node.content || '',
      level: node.level || 1,
      v_status: node.v_status || '',
      e_status: node.e_status || '',
      children: []
    }
    
    // 递归处理子节点
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      transformed.children = node.children.map(child => transformNode(child))
    }
    
    return transformed
  }
  
  return jsonData.map(node => transformNode(node))
}

// 计算属性：转换后的树数据
const treeData = computed(() => {
  return convertToTreeData(requirementTree.value)
})

// 处理节点点击事件
const handleNodeClick = (data, node, component) => {
  selectedNode.value = data
}

// 选择节点（保留用于兼容性）
const selectNode = (node) => {
  selectedNode.value = node
}

// 获取验证状态样式类（详情区域）
const getVStatusClass = (status) => {
  return status === true 
    ? 'bg-green-100 text-green-800 border border-green-300' 
    : 'bg-red-100 text-red-800 border border-red-300'
}

// 获取补全状态样式类（详情区域）
const getEStatusClass = (status) => {
  const statusMap = {
    'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    'pass': 'bg-green-100 text-green-800 border border-green-300',
    'fail': 'bg-red-100 text-red-800 border border-red-300',
  }
  return statusMap[status] || 'bg-slate-100 text-slate-800 border border-slate-300'
}

// 获取验证状态徽章样式类（树节点）
const getVStatusBadgeClass = (status) => {
  return status === true ? 'badge-green' : 'badge-red'
}

// 获取补全状态徽章样式类（树节点）
const getEStatusBadgeClass = (status) => {
  const statusMap = {
    'pending': 'badge-yellow',
    'pass': 'badge-green',
    'fail': 'badge-red',
  }
  return statusMap[status] || 'badge-gray'
}

// 获取验证状态文本
const getVStatusText = (status) => {
  return status === true ? '通过' : '未通过'
}

// 获取补全状态文本
const getEStatusText = (status) => {
  const statusMap = {
    'pending': '待补全',
    'pass': '已补全',
    'fail': '已拒绝',
  }
  return statusMap[status] || '未知'
}

// 加载模拟数据
const loadMockData = () => {
  requirementTree.value = [
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
  
  // 自动选择第一个节点
  if (requirementTree.value && requirementTree.value.length > 0) {
    selectedNode.value = requirementTree.value[0]
  }
}

// 跳转到下一步
const goToNext = () => {
  router.push({
    name: 'validate',
    params: { documentId: documentId.value },
    query: { docName: documentName.value }
  })
}

// 加载需求树数据
const loadRequirementTree = async () => {
  if (!documentId.value) return
  
  loading.value = true
  try {
    const result = await getParseResult(documentId.value)
    // 这里假设API返回的数据包含 requirement_tree 字段
    requirementTree.value = result.requirement_tree.children || null
    
    // 自动选择第一个节点
    if (requirementTree.value && requirementTree.value.length > 0) {
      selectedNode.value = requirementTree.value[0]
    }
  } catch (error) {
    console.error('Failed to load requirement tree:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRequirementTree()
})
</script>

<style scoped>
</style>
