import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'

// Import highlight.js styles (如果需要代码高亮)
import 'highlight.js/styles/github-dark.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
