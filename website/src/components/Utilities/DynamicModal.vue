<script setup>
import { computed } from 'vue';

const emit = defineEmits(["onClose"])
const props = defineProps({
	title: {
		type: String,
		default: "title",
	},
	description: {
		type: String,
		default: "",
	},
	size: {
		// sm, md, lg or xl
		type: String,
		default: "md",
	},
	buttonSize: {
		// sm, md or lg
		type: String,
		default: "md",
	},
	spacing: {
		// start, end, center, between, around or evenly
		type: String,
		default: "center",
	},
	hideCloseButton: {
		type: Boolean,
		default: false,
	},
	acceptButton: {
		// type: primary, secondary, success, danger, warning, ...bootstrap*
		type: Object,
		default: {
			disabled: false,
			type: "success",
			title: "accept",
			onClick: async () => {},
		},
	},
	declineButton: {
		type: Object,
		default: {
			disabled: false,
			type: "danger",
			title: "decline",
			onClick: async () => {},
		},
	},
	onClose: {
		type: Function,
		default: async () => {},
	},
})

const getSizeStyles = computed(() => {
	return `btn btn-${props.acceptButton.type} btn-${props.buttonSize}`
})
const getSpacingStyles = computed(() => {
	return `modal-footer d-flex justify-content-${props.spacing}`
})
const getAcceptButtonStyles = computed(() => {
	return `btn btn-${props.acceptButton.type} btn-${props.buttonSize}`
})
const getDeclineButtonStyles = computed(() => {
	return `btn btn-${props.declineButton.type} btn-${props.buttonSize}`
})

async function onClickAcceptButton() {
	await props.acceptButton.onClick()
	await closePopup()
}
async function onClickDeclineButton() {
	await props.declineButton.onClick()
	await closePopup()
}
async function onClickCloseButton() {
	await closePopup()
}
async function closePopup() {
	await props.onClose()
	await emit("onClose")
}
</script>

<template>
	<div class="overlay" @click.self="onClickCloseButton">
		<div class="modal-container position-fixed top-50 start-50" @click.self="onClickCloseButton">
			<div :class="`modal-dialog modal-${size}`">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">
							<b>{{ title }}</b>
						</h5>
						<button
							v-if="!hideCloseButton"
							type="button"
							class="btn-close"
							aria-label="Close"
							@click="onClickCloseButton"
						></button>
					</div>
					<div class="modal-body">
						<p>{{ description }}</p>
						<slot></slot>
					</div>
					<div :class="getSpacingStyles">
						<button
							v-if="!acceptButton.disabled"
							type="button"
							:class="getAcceptButtonStyles"
							@click="onClickAcceptButton"
						>
							{{ acceptButton.title }}
						</button>
						<button
							v-if="!declineButton.disabled"
							type="button"
							:class="getDeclineButtonStyles"
							@click="onClickDeclineButton"
						>
							{{ declineButton.title }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.modal-container {
	width: 100%;
	z-index: 9999;
	transform: translate(-50%,-50%) !important;
}

.modal-content {
	border-radius: 0%;
}

.modal-header {
	border: 0px;
}

.modal-footer {
	border: 0px;
}

.overlay {
	position: fixed;
	display: block;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 3;
}
</style>

<style>
/* Modal animation */
.dm-enter-active,
.dm-leave-active {
  transition: opacity 0.4s ease;
}

.dm-enter-from,
.dm-leave-to {
  opacity: 0;
}
</style>