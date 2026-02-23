import axios from 'axios'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: '/api',  // Vite 代理会将 /api 转发到后端
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 可以在这里添加 token
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  error => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error.response?.data || error.message)
    // 可以在这里统一处理错误
    if (error.response?.status === 401) {
      // 未授权处理
    } else if (error.response?.status === 500) {
      // 服务器错误处理
    }
    return Promise.reject(error)
  }
)

// ==================== API 方法封装 ====================

/**
 * 上传文档
 * @param {FormData} formData - 包含文档文件和元数据的表单数据
 * @returns {Promise} 返回文档ID和名称
 */
export const uploadDocument = (formData) => {
  return apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 获取文档列表
 * @returns {Promise} 返回文档列表
 */
export const getDocuments = () => {
  return apiClient.get('/documents')
}

/**
 * 获取文档详情
 * @param {string} id - 文档ID
 * @returns {Promise} 返回文档详细信息
 */
export const getDocumentDetail = (id) => {
  return apiClient.get(`/documents/${id}`)
}

/**
 * 解析文档
 * @param {string} documentId - 文档ID
 * @returns {Promise} 返回解析结果ID
 */
export const parseDocument = (documentId) => {
  return apiClient.post('/parse', { document_id: documentId })
}

/**
 * 获取解析结果
 * @param {string} parseId - 解析ID
 * @returns {Promise} 返回解析结果
 */
export const getParseResult = (parseId) => {
  return apiClient.get(`/parse/${parseId}`)
}

/**
 * 执行文档审查
 * @param {string} parseId - 解析ID
 * @param {object} options - 审查选项
 * @returns {Promise} 返回审查任务ID
 */
export const reviewDocument = (parseId, options = {}) => {
  return apiClient.post('/validate', { 
    doc_id: parseId,
    ...options 
  })
}

/**
 * 获取审查结果
 * @param {string} reviewId - 审查ID
 * @returns {Promise} 返回审查结果
 */
export const getReviewResult = (reviewId) => {
  return apiClient.get(`/validate/${reviewId}`)
}

/**
 * 导出审查报告
 * @param {string} reviewId - 审查ID
 * @param {string} format - 导出格式 (pdf/docx/html)
 * @returns {Promise} 返回文件下载URL或Blob
 */
export const exportReport = (reviewId, format = 'pdf') => {
  return apiClient.get(`/review/${reviewId}/export`, {
    params: { format },
    responseType: 'blob'
  })
}

export default apiClient
