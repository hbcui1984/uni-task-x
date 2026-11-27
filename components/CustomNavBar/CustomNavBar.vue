<template>
	<view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
		<view class="navbar-container" :style="capsuleRightPadding ? { paddingRight: capsuleRightPadding + 'px' } : {}">
			<!-- 左侧返回按钮 -->
			<view class="navbar-left" @click="handleBack">
				<view class="back-button">
					<text class="back-icon">‹</text>
				</view>
				<text v-if="showBackText" class="back-text">返回</text>
			</view>

			<!-- 中间标题 -->
			<view class="navbar-center">
				<text class="navbar-title">{{ title }}</text>
				<text v-if="subtitle" class="navbar-subtitle">{{ subtitle }}</text>
			</view>

			<!-- 右侧操作区 -->
			<view class="navbar-right">
				<slot name="right"></slot>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { onMounted, ref } from 'vue'

	defineOptions({ name: 'CustomNavBar' })

	const props = defineProps({
		// 标题
		title: {
			type: String,
			default: ''
		},
		// 副标题
		subtitle: {
			type: String,
			default: ''
		},
		// 是否显示返回文字
		showBackText: {
			type: Boolean,
			default: false
		},
		// 背景色
		backgroundColor: {
			type: String,
			default: '#ffffff'
		},
		// 是否固定在顶部
		fixed: {
			type: Boolean,
			default: false
		},
		// 自定义返回地址
		backUrl: {
			type: String,
			default: ''
		}
	})
	const emit = defineEmits(['back'])
	const statusBarHeight = ref(0)
	const capsuleRightPadding = ref(0)

	onMounted(() => {
		const windowInfo = uni.getWindowInfo()
		statusBarHeight.value = windowInfo.statusBarHeight || 0
		// #ifdef MP-WEIXIN
		try {
			const capsule = uni.getMenuButtonBoundingClientRect()
			if (capsule && capsule.width > 0 && capsule.left > 0 && capsule.left < windowInfo.windowWidth) {
				capsuleRightPadding.value = windowInfo.windowWidth - capsule.left + 4
			}
		} catch {
			// 无法获取胶囊尺寸时保留默认右侧间距
		}
		// #endif
	})

	function handleBack() {
		if (props.backUrl) {
			uni.redirectTo({ url: props.backUrl })
		} else if (getCurrentPages().length > 1) {
			uni.navigateBack({ delta: 1 })
		} else {
			uni.reLaunch({ url: '/pages/opendb-projects/list' })
		}
		emit('back')
	}
</script>

<style scoped>
.custom-navbar {
	background-color: var(--color-white);
	border-bottom: 1px solid var(--color-border);
	position: relative;
	z-index: 999;
}

.navbar-container {
	height: 44px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 0 var(--spacing-base);
	position: relative;
}

/* ===== 左侧返回按钮 ===== */
.navbar-left {
	display: flex;
	flex-direction: row;
	align-items: center;
	min-width: 60px;
	flex-shrink: 0;
	cursor: pointer;
	position: relative;
	z-index: 1;
}

.back-button {
	width: 32px;
	height: 32px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	border-radius: var(--radius-full);
	background-color: transparent;
	transition: var(--transition-base);
}

.back-button:hover {
	background-color: var(--color-gray-1);
}

.back-button:active {
	background-color: var(--color-gray-2);
	transform: scale(0.95);
}

.back-icon {
	font-size: 32px;
	font-weight: var(--font-weight-bold);
	color: var(--color-primary);
	line-height: 1;
}

.back-text {
	font-size: var(--font-size-base);
	color: var(--color-primary);
	margin-left: 4px;
	font-weight: var(--font-weight-medium);
}

/* ===== 中间标题 ===== */
.navbar-center {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	flex-direction: column;
	align-items: center;
	max-width: 60%;
}

.navbar-title {
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text-primary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 100%;
}

.navbar-subtitle {
	font-size: var(--font-size-xs);
	color: var(--color-text-secondary);
	margin-top: 2px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 100%;
}

/* ===== 右侧操作区 ===== */
.navbar-right {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: var(--spacing-sm);
	min-width: 60px;
	justify-content: flex-end;
	flex-shrink: 0;
	position: relative;
	z-index: 1;
}

/* ===== 响应式优化 ===== */
@media (max-width: 375px) {
	.navbar-title {
		font-size: var(--font-size-base);
	}

	.back-icon {
		font-size: 28px;
	}

	.navbar-center {
		max-width: 50%;
	}
}

/* PC 端优化 */
@media (min-width: 800px) {
	.custom-navbar {
		box-shadow: var(--shadow-sm);
	}

	.navbar-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-xl);
	}

	.back-button:hover {
		background-color: var(--color-bg-hover);
	}
}
</style>
