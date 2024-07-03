<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from "vue"

const content = ref()

// Define props and emit to handle v-model binding
const props = defineProps(["modelValue", "label", "maxDisplayItems"])
const emit = defineEmits(["update:modelValue"])

// Create compute to handle v-model value
const modelValue = computed({
	get() {
		return props.modelValue ?? []
	},
	set(value) {
		emit("update:modelValue", value)
	},
})

// Get label and maxDisplayItems
const label = props?.label ?? "Select"
const maxDisplayItems = props?.maxDisplayItems ?? 4

function onClickSelect() {
	// Enable or disable filter select bar
	content.value.style.display = content.value.style.display == "block" ? "none" : "block"
}

function onClickOption(e) {
	// Get option value
	let optionValue = e.target.value
	// Check if value is included in modelValue array
	if (modelValue.value.includes(optionValue)) {
		// Remove option from modelValue
		modelValue.value.splice(modelValue.value.indexOf(optionValue), 1)
		// Deselect value
		e.target.selected = false
	} else {
		// Add value to modelValue
		modelValue.value.push(optionValue)
		// Select value
		e.target.selected = true
	}
}

function onClickFilterClose(optionValue) {
	// Check if value is included in modelValue array
	if (modelValue.value.includes(optionValue)) {
		// Remove value from modelValue
		modelValue.value.splice(modelValue.value.indexOf(optionValue), 1)

		// Update child select state based on optionValue
		// TODO: find a better way to change this, we only
		// need one option to be deselected. Do we have
		// to loop all the children again? (29-06-2023, sid)
		for (let child of content.value.children) {
			if (child.value != optionValue) continue

			child.selected = false
			break
		}
	}
}

function onClickOutsideContent(){
	// Check if filter select bar is disabled
	if(content.value.style.display == "none")
		return

	// Disable filter select bar
	content.value.style.display = "none"
}

onMounted(() => {
	// Loop all options provided by user
	for (let child of content.value.children) {
		// Update selected based on initial value
		// Check if value is included in modelValue array
		// this method can also parses the values to string
		for (let i = 0; i < modelValue.value.length; i++) {
			// Parse value to string
			let optionValue = String(modelValue.value[i]);
			// Update value
			modelValue.value[i] = optionValue
			
			// Check if option is included
			if(child.value != optionValue)
				continue
			
			// Set selected to true
			child.selected = true
		}

		// Add event listener
		child.addEventListener("click", onClickOption)
	}
})

onBeforeUnmount(() => {
	// Loop all options provided by user
	for (let child of content.value.children) {
		// Remove event listener
		child.removeEventListener("click", onClickOption)
	}
})
</script>

<template>
	<div id="countries" class="multiselect" multiple="multiple" data-target="multi-0" v-click-outside="onClickOutsideContent">
		<div class="title noselect" @click.self="onClickSelect">
			<span class="text">
				{{ modelValue.length <= 0 ? label : "" }}
				<template v-for="(value, i) in modelValue" :key="i">
					<span v-if="i < maxDisplayItems" class="filter badge bg-secondary">
						{{ value }}
						<i class="filter-close fa-solid fa-xmark fa-2xs" @click="onClickFilterClose(value)"></i>
					</span>
				</template>
				<i v-if="modelValue.length > maxDisplayItems" class="filter badge bg-secondary">
					+{{ modelValue.length - maxDisplayItems }}
				</i>
			</span>
		</div>
		<div ref="content" class="container">
			<!-- <option v-for="(option) in props?.options ?? []" :key="option" :value="option">{{option}}</option> -->
			<slot></slot>
		</div>
	</div>
</template>

<style scoped>
.noselect {
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	-khtml-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}

.multiselect {
	position: relative;
	width: 100%;
	font-size: 15px;
	padding-bottom: 4px;
	border-radius: 3px;
	border: 1px solid rgba(0, 0, 0, 0.3);
	transition: 0.2s;
	outline: none;
	background-color: #fff;
	background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
	background-repeat: no-repeat;
	background-position: right 0.75rem center;
	background-size: 16px 12px;
}

.multiselect:hover {
	border: 1px solid rgba(0, 0, 0, 0.3);
}

.multiselect.active {
	border-bottom-left-radius: 0px;
	border-bottom-right-radius: 0px;
	border-bottom: 1px solid transparent;
}

.multiselect > .title {
	cursor: pointer;
	height: 32px;
	padding: 8px;
	padding-left: 3px;
}

.multiselect > .title > .text {
	max-height: 32px;
	display: block;
	float: left;
	overflow: hidden;
	line-height: 1.3em;
}

.multiselect > .title > .text > .filter {
	margin: 1px;
}

.multiselect > .title > .text > .filter > .filter-close:hover {
	color: rgba(0, 0, 0, 0.3);
}

.multiselect > .container {
	display: none;
	max-height: 200px;
	overflow: auto;
	margin-top: 4px;
	margin-left: -1px;
	padding: 0px;
	transition: 0.2s;
	position: absolute;
	z-index: 99;
	background: #fff;
	border: 1px solid transparent;
	border-top: 1px solid rgba(0, 0, 0, 0.3);
}

.multiselect.active > .container {
	border: 1px solid rgba(0, 0, 0, 0.3);
	border-bottom-left-radius: 3px;
	border-bottom-right-radius: 3px;
	border-top: 0;
}

.multiselect:hover > .container {
	border-top-color: rgba(0, 0, 0, 0.3);
}

.multiselect.active:hover > .container {
	border-color: rgba(0, 0, 0, 0.3);
}

.multiselect > .container > option,
.multiselect > .container:deep() option {
	display: block;
	padding: 5px;
	cursor: pointer;
	transition: 0.2s;
	border-top: 1px solid transparent;
	border-bottom: 1px solid transparent;
}

.multiselect > .container:deep() option.selected {
	background: rgb(122, 175, 233);
	border-top: 1px solid rgba(0, 0, 0, 0.1);
	border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	color: #fff;
}

.multiselect > .container:deep() option:hover {
	background: rgba(0, 0, 0, 0.1);
	color: #000;
}

.multiselect.active > .container:deep() option {
	display: block;
}
</style>
