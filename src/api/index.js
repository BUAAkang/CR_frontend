import axios from 'axios'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: '/api',  // Vite 代理会将 /api 转发到后端
  timeout: 300000,
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
// 说明：所有接口统一使用 docId（文档ID）作为唯一标识
// 上传后获得 docId，后续所有操作都基于这个 docId 进行

/**
 * 上传文档
 * @param {FormData} formData - 包含文档文件和元数据的表单数据
 * @returns {Promise} 返回文档ID和名称 { doc_id, doc_name }
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
 * @param {string} docId - 文档ID
 * @returns {Promise} 返回文档详细信息
 */
export const getDocumentDetail = (docId) => {
  return apiClient.get(`/documents/${docId}`)
}

/**
 * 获取解析结果（需求树）
 * @param {string} docId - 文档ID
 * @returns {Promise} 返回解析后的需求树结构
 */
export const getParseResult = (docId) => {
  return apiClient.get(`/parse/${docId}`)
}

/**
 * 获取验证结果
 * @param {string} docId - 文档ID
 * @returns {Promise} 返回验证结果 { validation_results: [...] }
 */
export const getReviewResult = (docId) => {
  return apiClient.get(`/validate/${docId}`)
}

/**
 * 导出需求树（JSON格式）
 * @param {string} docId - 文档ID
 * @returns {Promise} 返回扁平化的需求列表 { requirements: [...], total_requirements: number }
 */
export const exportRequirements = (docId) => {
  return apiClient.get(`/export/${docId}`)
}

export default apiClient
