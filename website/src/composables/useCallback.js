import { onMounted, onUnmounted } from "vue"

export default function useCallback() {
	var callbacks = []

	function callback(func) {
		onMounted(() => {
			callbacks.push(func)
		})
		onUnmounted(() => {
			let index = callbacks.indexOf(func)
			if (index !== -1) {
				callbacks.splice(index, 1)
			}
		})
	}

	async function invoke(...args) {
		for (let i = 0; i < callbacks.length; i++) {
			await callbacks[i](...args)
		}
	}

	return {
		callback,
		invoke,
	}
}
