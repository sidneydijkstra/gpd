export default function useClickOutside(app) {
	app.directive("click-outside", {
		mounted(el, binding, vnode, prevVnode) {
			el.clickOutsideEvent = function (event) {
				// Here I check that click was outside the el and his children
				if (!(el == event.target || el.contains(event.target))) {
					// If it did, call method provided in attribute value
					binding.value(event)
				}
			}

			document.body.addEventListener("click", el.clickOutsideEvent)
		},
		unmounted(el, binding, vnode, prevVnode) {
			document.body.removeEventListener("click", el.clickOutsideEvent)
		},
	})
}
