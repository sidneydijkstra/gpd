import useClickOutside from "./useClickOutside"

const directives = {
	install: (app, config) => {
		useClickOutside(app)
	},
}

export default directives
