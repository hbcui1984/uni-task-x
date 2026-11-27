import { createSSRApp } from 'vue'
import App from './App.uvue'
import store from './store/index.js'
import { initUniIdPageStore } from './js_sdk/uni-id-pages/store.js'

export function createApp() {
	const app = createSSRApp(App)
	app.use(store)
	initUniIdPageStore(app)
	return { app }
}
