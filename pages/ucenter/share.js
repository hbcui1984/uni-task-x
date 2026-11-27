export function shareLink(url, summary) {
	if (!url) {
		uni.showToast({ title: '尚未配置分享链接', icon: 'none' })
		return
	}
	const copy = () => uni.setClipboardData({
		data: url,
		fail: () => uni.showToast({ title: '复制链接失败', icon: 'none' })
	})
	// #ifdef APP
	uni.showActionSheet({
		itemList: ['系统分享', '复制链接'],
		success: ({ tapIndex }) => {
			if (tapIndex === 1) return copy()
			uni.shareWithSystem({
				type: 'text', href: url, summary,
				fail: err => {
					if (err.errCode !== 1310600) uni.showToast({ title: '分享失败，可选择复制链接', icon: 'none' })
				}
			})
		}
	})
	// #endif
	// #ifndef APP
	copy()
	// #endif
}
