# 文档审查模块 - 前端项目

> 装备软件智能测试一体化解决方案 - 文档审查模块前端

## 📋 项目简介

本项目是**装备软件智能测试一体化解决方案**中"文档审查"模块的前端实现，基于"单元测试"模块的工程规范提取和改造而成。

### 功能流程

1. **文档上传** - 上传需要审查的文档（支持 PDF、DOC、DOCX、TXT 等格式）
2. **文档解析** - 自动解析文档内容，提取关键信息
3. **审查分析** - 执行多维度智能审查（语法、格式、一致性、完整性）
4. **审查报告** - 生成详细的审查报告，支持导出

## 🚀 技术栈

- **Vue 3.3.11** - Progressive JavaScript Framework
- **Vite 5.0.8** - Next Generation Frontend Tooling
- **Vue Router 4.2.5** - Official Router
- **Pinia 2.1.7** - State Management
- **Tailwind CSS 3.3.6** - Utility-First CSS Framework
- **Axios 1.6.2** - HTTP Client
- **Lucide Vue Next** - Icon Library
- **Highlight.js** - Code Syntax Highlighting

## 📦 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
doc-review-scaffold/
├── public/                 # 静态资源
├── src/
│   ├── components/        # 可复用组件
│   │   └── NavBar.vue    # 导航栏（步骤进度）
│   ├── views/            # 页面视图
│   │   ├── UploadView.vue    # 文档上传页面
│   │   ├── ParseView.vue     # 文档解析页面
│   │   ├── ReviewView.vue    # 审查分析页面
│   │   └── ReportView.vue    # 审查报告页面
│   ├── router/
│   │   └── index.js      # 路由配置
│   ├── store/
│   │   └── index.js      # Pinia 状态管理
│   ├── api/
│   │   └── index.js      # API 接口封装
│   ├── App.vue           # 根组件
│   ├── main.js           # 应用入口
│   └── style.css         # 全局样式
├── index.html
├── package.json
├── vite.config.js        # Vite 配置
├── tailwind.config.js    # Tailwind CSS 配置
├── postcss.config.js     # PostCSS 配置
└── README.md
```

## 🔧 配置说明

### API 代理配置

在 `vite.config.js` 中配置后端 API 地址：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',  // 修改为实际后端地址
      changeOrigin: true,
    }
  }
}
```

### 主题色配置

在 `tailwind.config.js` 中自定义主色调：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // 自定义色值
        900: '#1e3a8a',  // 主要使用的深蓝色
      }
    }
  }
}
```

## 🌐 API 接口

本项目使用 Axios 进行 API 调用，所有接口封装在 `src/api/index.js` 中。

### 主要接口

- `uploadDocument(formData)` - 上传文档
- `getDocuments()` - 获取文档列表
- `parseDocument(documentId)` - 解析文档
- `reviewDocument(parseId, options)` - 执行审查
- `getReviewResult(reviewId)` - 获取审查结果
- `exportReport(reviewId, format)` - 导出报告

**注意**: 需要根据实际后端接口调整 API 方法。

## 📱 路由配置

项目采用 4 个主要路由页面：

| 路由 | 组件 | 说明 | 访问控制 |
|------|------|------|----------|
| `/` | UploadView | 文档上传 | 无限制 |
| `/parse` | ParseView | 文档解析 | 需要 documentId |
| `/review` | ReviewView | 审查分析 | 需要 parseId |
| `/report` | ReportView | 审查报告 | 需要 reviewId |

每个路由都有相应的访问控制（beforeEnter 守卫），确保用户按照正确的流程操作。

## 💾 状态管理

使用 Pinia 管理全局状态，主要状态包括：

```javascript
state: {
  documentId: null,      // 当前文档 ID
  documentName: null,    // 当前文档名称
  parseId: null,         // 解析结果 ID
  reviewId: null,        // 审查结果 ID
}
```

状态会自动同步到 localStorage，页面刷新后仍可保持。

## 🎨 设计规范

### 色彩系统

- **主色调**: Primary 蓝色系（`primary-900` 为主）
- **中性色**: Slate 系列
- **功能色**: 绿色（成功）、红色（错误）、黄色（警告）、蓝色（信息）

### 组件样式

- **圆角**: `rounded-lg` (8px), `rounded-xl` (12px), `rounded-full`
- **阴影**: `shadow-sm`, `shadow-md`, `shadow-2xl`
- **间距**: 4的倍数（4px, 8px, 16px, 24px, 32px）
- **字体**: font-medium (500), font-semibold (600), font-bold (700)

### 动画过渡

- 通用过渡: `transition-all duration-200`
- 悬浮效果: `hover:bg-primary-800`
- 点击效果: `active:scale-95`

## 🔄 适配其他模块

本脚手架可轻松适配其他模块（需求理解、代码分析等）：

### 需要修改的文件

1. **package.json** - 修改项目名称
2. **index.html** - 修改页面标题
3. **src/components/NavBar.vue** - 修改 Logo 和步骤定义
4. **src/router/index.js** - 修改路由配置
5. **src/store/index.js** - 修改状态字段
6. **src/api/index.js** - 修改 API 接口
7. **src/views/** - 创建对应的视图组件

### 保持不变的部分

✅ 项目结构  
✅ 配置文件（vite、tailwind、postcss）  
✅ 设计系统（颜色、字体、间距）  
✅ 组件样式风格  
✅ 路由守卫模式  

## 📖 开发指南

### 添加新页面

1. 在 `src/views/` 创建新组件
2. 在 `src/router/index.js` 添加路由
3. 在 `src/components/NavBar.vue` 添加导航步骤
4. 更新 store 状态（如需要）

### 调用 API

```vue
<script setup>
import { getDocuments } from '@/api'

const fetchData = async () => {
  try {
    const data = await getDocuments()
    console.log(data)
  } catch (error) {
    console.error('API Error:', error)
  }
}
</script>
```

### 使用状态管理

```vue
<script setup>
import { useAppStore } from '@/store'

const store = useAppStore()

// 读取状态
console.log(store.documentId)

// 调用 actions
store.setDocument('123', 'test.pdf')
</script>
```

## 🐛 已知问题

- API 接口需要根据实际后端进行调整
- 部分模拟数据需要替换为真实数据

## 📄 许可证

本项目仅供内部使用。

---

## 👥 团队协作

### Git 提交规范（建议）

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具配置
```

### 联系方式

如有问题，请联系前端开发团队。

---

**最后更新**: 2026-02-09  
**版本**: v1.0.0
