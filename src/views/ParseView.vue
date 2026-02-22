<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="border-b border-slate-200 px-8 py-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-slate-900">需求分析</h1>
        <p class="text-slate-500 font-medium mt-2">软件需求文档结构树</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden flex">
      <!-- Left: Tree View -->
      <div class="w-1/3 border-r border-slate-200 overflow-y-auto p-6">
        <div class="space-y-2">
          <div v-if="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p class="text-sm text-slate-600 mt-3">加载需求树...</p>
          </div>
          
          <div v-else-if="treeData && treeData.length > 0" class="requirement-tree">
            <el-tree
              :data="treeData"
              :props="treeProps"
              node-key="id"
              :default-expand-all="true"
              :highlight-current="true"
              @node-click="handleNodeClick"
              class="custom-tree"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <span class="node-label">{{ data.label }}</span>
                  <span class="node-badges">
                    <span v-if="data.v_status !== undefined && data.v_status !== null" 
                          class="badge" 
                          :class="getVStatusBadgeClass(data.v_status)"
                          :title="getVStatusText(data.v_status)">
                      验证
                    </span>
                    <span v-if="data.e_status" 
                          class="badge" 
                          :class="getEStatusBadgeClass(data.e_status)"
                          :title="getEStatusText(data.e_status)">
                      补全
                    </span>
                  </span>
                </span>
              </template>
            </el-tree>
          </div>
          
          <div v-else class="text-center py-8 text-slate-400">
            <FileText class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p class="text-sm">暂无需求数据</p>
            <button 
              @click="loadMockData"
              class="mt-4 px-4 py-2 bg-primary-900 hover:bg-primary-800 text-white text-sm font-semibold rounded-lg transition-all"
            >
              加载示例数据
            </button>
          </div>
        </div>
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
              <span v-if="selectedNode.v_status !== undefined && selectedNode.v_status !== null" 
                    class="px-3 py-1 text-xs font-semibold rounded" 
                    :class="getVStatusClass(selectedNode.v_status)">
                验证: {{ getVStatusText(selectedNode.v_status) }}
              </span>
              <span v-if="selectedNode.e_status" 
                    class="px-3 py-1 text-xs font-semibold rounded" 
                    :class="getEStatusClass(selectedNode.e_status)">
                补全: {{ getEStatusText(selectedNode.e_status) }}
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
          <span>进入需求补全</span>
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { parseDocument, getParseResult } from '../api'
import { FileText, ChevronRight } from 'lucide-vue-next'
import { ElTree } from 'element-plus'
import 'element-plus/dist/index.css'

const router = useRouter()
const store = useAppStore()

const loading = ref(false)
const requirementTree = ref(null)
const selectedNode = ref(null)

// Element Plus Tree 的配置
const treeProps = {
  children: 'children',
  label: 'label',
}

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
  router.push('/review')
}

// 加载需求树数据
const loadRequirementTree = async () => {
  if (!store.parseId) return
  
  loading.value = true
  try {
    const result = await getParseResult(store.parseId)
    // 这里假设API返回的数据包含 requirement_tree 字段
    requirementTree.value = result.requirement_tree || null
    
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
/* Element Plus Tree 自定义样式 */
.requirement-tree :deep(.el-tree) {
  background: transparent;
  color: #334155;
}

.requirement-tree :deep(.el-tree-node__content) {
  height: auto;
  min-height: 32px;
  padding: 4px 0;
  border-radius: 6px;
  transition: all 0.2s;
}

.requirement-tree :deep(.el-tree-node__content:hover) {
  background-color: #f1f5f9;
}

.requirement-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #0f172a !important;
  color: white;
}

/* 只针对当前节点本身，不影响子节点 */
.requirement-tree :deep(.el-tree-node.is-current > .el-tree-node__content .custom-tree-node) {
  color: white;
}

/* 选中时勋章保持深色调填充 */
.requirement-tree :deep(.el-tree-node.is-current > .el-tree-node__content .badge-green) {
  background-color: #166534;
  border-color: #166534;
  color: white;
}

.requirement-tree :deep(.el-tree-node.is-current > .el-tree-node__content .badge-yellow) {
  background-color: #854d0e;
  border-color: #854d0e;
  color: white;
}

.requirement-tree :deep(.el-tree-node.is-current > .el-tree-node__content .badge-red) {
  background-color: #991b1b;
  border-color: #991b1b;
  color: white;
}

.requirement-tree :deep(.el-tree-node.is-current > .el-tree-node__content .badge-gray) {
  background-color: #475569;
  border-color: #475569;
  color: white;
}

.requirement-tree :deep(.el-tree-node__expand-icon) {
  font-size: 14px;
  color: #64748b;
}

/* 只针对当前节点的展开图标，不影响子节点 */
.requirement-tree :deep(.el-tree-node.is-current > .el-tree-node__content .el-tree-node__expand-icon) {
  color: white;
}

/* 自定义树节点样式 */
.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 8px;
}

.node-label {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-badges {
  display: flex;
  gap: 4px;
  margin-left: 8px;
}

.badge {
  display: inline-block;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
  border: 1px solid;
}

.badge-green {
  background-color: #dcfce7;
  border-color: #86efac;
  color: #166534;
}

.badge-yellow {
  background-color: #fef3c7;
  border-color: #fde047;
  color: #854d0e;
}

.badge-red {
  background-color: #fee2e2;
  border-color: #fca5a5;
  color: #991b1b;
}

.badge-gray {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}
</style>
