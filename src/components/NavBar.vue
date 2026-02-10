<template>
  <nav class="bg-white border-b border-slate-200 px-6 py-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Logo 区域 -->
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-primary-900 rounded flex items-center justify-center">
          <span class="font-bold text-white">D</span>
        </div>
        <span class="text-lg font-bold tracking-tight text-slate-900">Doc Review</span>
      </div>

      <!-- 步骤导航 -->
      <div class="flex items-center space-x-4">
        <template v-for="(step, index) in steps" :key="step.path">
          <div class="flex items-center">
            <!-- 连接线 -->
            <div v-if="index > 0" class="h-px w-8 mx-2" :class="getConnectorClass(index)"></div>
            
            <!-- 步骤项 -->
            <router-link 
              :to="step.path"
              :class="getStepClass(index)"
              @click.prevent="handleStepClick(index, step.path)"
              class="flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-200"
            >
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" :class="getIconClass(index)">
                <component :is="CheckIcon" class="w-4 h-4" v-if="isCompleted(index)" />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span class="text-sm font-semibold">{{ step.name }}</span>
            </router-link>
          </div>
        </template>
      </div>

      <!-- 右侧信息区 -->
      <div class="flex items-center space-x-4 text-xs text-slate-500">
        <div v-if="store.documentName" class="flex items-center bg-slate-100 px-3 py-1 rounded-full">
          <span class="opacity-60 mr-2 font-medium">Document:</span>
          <span class="text-slate-900 font-semibold">{{ store.documentName }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { Check, Upload, FileText, CheckCircle, FileCheck } from 'lucide-vue-next'

const store = useAppStore()
const route = useRoute()
const router = useRouter()

const CheckIcon = Check

// 步骤定义 - 根据文档审查流程定制
const steps = [
  { name: '文档上传', path: '/', icon: Upload },
  { name: '文档解析', path: '/parse', icon: FileText },
  { name: '审查分析', path: '/review', icon: CheckCircle },
  { name: '审查报告', path: '/report', icon: FileCheck },
]

// 当前步骤索引
const currentStepIndex = computed(() => {
  const path = route.path
  if (path === '/') return 0
  if (path === '/parse') return 1
  if (path === '/review') return 2
  if (path === '/report') return 3
  return 0
})

// 判断步骤是否已完成
const isCompleted = (index) => {
  if (index === 0) return store.documentId !== null && currentStepIndex.value > 0
  if (index === 1) return store.parseId !== null && currentStepIndex.value > 1
  if (index === 2) return store.reviewId !== null && currentStepIndex.value > 2
  return false
}

// 判断步骤是否为当前激活步骤
const isActive = (index) => currentStepIndex.value === index

// 判断步骤是否禁用
const isDisabled = (index) => {
  if (index === 0) return false
  if (index === 1) return store.documentId === null
  if (index === 2) return store.parseId === null
  if (index === 3) return store.reviewId === null
  return true
}

// 获取步骤样式类
const getStepClass = (index) => {
  if (isActive(index)) return 'bg-primary-900 text-white shadow-md'
  if (isCompleted(index)) return 'text-green-600 hover:bg-green-50'
  if (isDisabled(index)) return 'text-slate-300 cursor-not-allowed'
  return 'text-slate-600 hover:bg-slate-100'
}

// 获取图标样式类
const getIconClass = (index) => {
  if (isActive(index)) return 'bg-white text-primary-900'
  if (isCompleted(index)) return 'bg-green-500 text-white'
  if (isDisabled(index)) return 'bg-slate-100 text-slate-300'
  return 'bg-slate-200 text-slate-600'
}

// 获取连接线样式类
const getConnectorClass = (index) => {
  if (index <= currentStepIndex.value) return 'bg-primary-900'
  return 'bg-slate-200'
}

// 处理步骤点击
const handleStepClick = (index, path) => {
  if (!isDisabled(index)) {
    router.push(path)
  }
}
</script>
