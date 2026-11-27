// 仅由 WEB 条件编译分支导入。showPicker 需要在原始点击事件中同步调用。
export function openWebDatePicker(value, position, onChange) {
	const input = document.createElement('input')
	input.type = 'date'
	input.value = value || ''
	Object.assign(input.style, {
		position: 'fixed', width: '1px', height: '1px', opacity: '0', padding: '0', border: '0', zIndex: '9999',
		left: position?.left == null ? '50%' : `${position.left}px`,
		top: position?.top == null ? '50%' : `${position.top}px`
	})
	let blurTimer
	function close() {
		clearTimeout(blurTimer)
		input.onblur = input.onchange = input.oncancel = null
		input.remove()
	}
	input.onchange = () => {
		const date = input.value
		close()
		onChange(date)
	}
	input.oncancel = close
	input.onblur = () => { blurTimer = setTimeout(close, 200) }
	document.body.appendChild(input)
	input.focus({ preventScroll: true })
	try {
		input.showPicker()
	} catch {
		input.click()
	}
	return close
}
