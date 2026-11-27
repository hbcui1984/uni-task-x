import pages from '@/pages.json'

export function loginUrl() {
	const path = pages.uniIdRouter?.loginPage || 'uni_modules/uni-id-pages/pages/login/login-withoutpwd'
	return path.startsWith('/') ? path : '/' + path
}

export function openProfile(hasLogin) {
	uni.navigateTo({ url: hasLogin ? '/uni_modules/uni-id-pages/pages/userinfo/userinfo' : loginUrl() })
}
