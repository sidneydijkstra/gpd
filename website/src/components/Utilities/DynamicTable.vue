<template>
	<div class="dt-container">
		<form class="row g-3">
			<!-- Page size selector -->
			<div v-if="table.tableOptions.pages && table.tableOptions.pageSizing && !table.tableOptions.scroll" class="col-2">
				<select v-model="table.tableSize" class="form-select">
					<option
						v-for="size in table.tableOptions.pageSizes"
						:key="size"
						:value="size"
						:selected="table.tableOptions.tableSize == size"
					>
						{{ size }}
					</option>
					<option v-if="table.tableOptions.pageAll" :value="table.tableContent.length">all</option>
				</select>
			</div>
			<div v-else class="col-2"></div>

			<!-- Empty space -->
			<div class="col-2"></div>

			<!-- Search input and filter wrapper -->
			<template v-if="table.tableOptions.search">
				<!-- Filter for search input -->
				<div v-if="table.tableOptions.filterSearch" class="col-4">
					<MultiSelect v-if="!table.isLoading" v-model="table.tableSearchFilter" :label="'Select Filter'">
						<option v-for="header in table.tableHeaders" :key="header" :value="header">{{ header }}</option>
					</MultiSelect>
				</div>
				<div v-else class="col-4"></div>

				<!-- Search input -->
				<div class="col-4">
					<div class="input-group">
						<span id="basic-addon1" class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
						<input v-model="table.tableSearch" type="text" class="form-control" />
					</div>
				</div>
			</template>
			<div v-else class="col-8"></div>
		</form>

		<div
			:class="{ 'dt-table-responsive': table.tableOptions.scroll }"
			:style="{ height: table.tableOptions.scroll ? `${table.tableOptions.size * 41 + 41}px` : `100%` }"
		>
			<table class="table table-hover">
				<thead>
					<tr>
						<!-- <th scope="col"># {{loading ? "Loading..." : ""}}</th> -->
						<th v-if="table.tableOptions.ids" scope="row">#</th>
						<td v-for="(header, i) in table.tableHeaders" :key="header">
							<div class="d-flex justify-content-between">
								{{ header }}
								<button v-if="table.tableOptions.sort" class="btn btn-sm" @click="table.sort(i)">
									<i v-if="table.tableSortStates[i] == 0" class="fa-solid fa-sort"></i>
									<i v-if="table.tableSortStates[i] == -1" class="fa-solid fa-sort-up"></i>
									<i v-if="table.tableSortStates[i] == 1" class="fa-solid fa-sort-down"></i>
								</button>
							</div>
						</td>
					</tr>
				</thead>
				<tbody ref="tableBody" v-click-outside="table.unselect">
					<tr
						v-for="(values, i) in table.tableContent"
						:key="values"
						:class="{ selected: table.tableSelectIndex == i || table.isIndexInMultiselect(i) }"
						@click.left.exact="table.select(i)"
						@click.shift="table.multiselect(i)"
					>
						<th v-if="table.tableOptions.ids" scope="row">{{ i + 1 + table.tableCurrentPage * table.tableMaxSize }}</th>
						<td v-for="value in values" :key="value">
							{{ value }}
						</td>
						
						<td v-for="(button, j) in table.tableButtons" :key="j">
							<button class="btn btn-primary" @click="button.onClick(table.tableIntactContent[i])">{{ button.name(table.tableIntactContent[i]) }}</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div v-if="table.tableOptions.pages && !table.tableOptions.scroll" class="d-flex justify-content-between">
			<p>{{ table.tableCurrentPage + 1 }}/{{ table.tableMaxPage + 1 }} - {{ table.tableContent.length }} items</p>

			<nav :key="table.tableCurrentPage" aria-label="Page navigation example">
				<ul class="pagination justify-content-end">
					<li class="page-item" :class="{ disabled: table.tableCurrentPage <= 0 }">
						<a class="page-link" @click="table.navigate(table.tableCurrentPage - 1)">Previous</a>
					</li>

					<li v-if="table.tableCurrentPage > 0" class="page-item">
						<a class="page-link" @click="table.navigate(table.tableCurrentPage - 1)">{{ table.tableCurrentPage }}</a>
					</li>
					<li class="page-item active">
						<a class="page-link">{{ table.tableCurrentPage + 1 }}</a>
					</li>
					<li v-if="table.tableCurrentPage < table.tableMaxPage" class="page-item">
						<a class="page-link" @click="table.navigate(table.tableCurrentPage + 1)">
							{{ table.tableCurrentPage + 2 }}
						</a>
					</li>

					<li class="page-item" :class="{ disabled: table.tableCurrentPage >= table.tableMaxPage }">
						<a class="page-link" @click="table.navigate(table.tableCurrentPage + 1)">Next</a>
					</li>
				</ul>
			</nav>
		</div>
		<p v-else>{{ table.tableContent.length }} items</p>
	</div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue"
import MultiSelect from "./MultiSelect.vue"
import useTable from "@/composables/useTable.js"

const emit = defineEmits(["onSelect", "onMultiselect"])
const props = defineProps({
	data: {
		type: Array,
		default: [],
	},
	headers: {
		type: Array,
		default: [],
	},
	parse: {
		Type: Object,
		default: {},
	},
	buttons: {
		Type: Array,
		default: [],
	},
	ignore: {
		Type: Array,
		default: [],
	},
	include: {
		Type: Array,
		default: [],
	},
	filter: {
		Type: Function,
		default: (value) => true
	},
	size: {
		Type: Number,
		default: 5,
	},
	ids: {
		Type: Boolean,
		default: true,
	},
	select: {
		Type: Boolean,
		default: false,
	},
	multiselect: {
		Type: Boolean,
		default: false,
	},
	selectBoundCheck: {
		Type: Boolean,
		default: true,
	},
	sort: {
		Type: Boolean,
		default: false,
	},
	search: {
		Type: Boolean,
		default: false,
	},
	filterSearch: {
		Type: Boolean,
		default: false,
	},
	scroll: {
		Type: Boolean,
		default: false,
	},
	pages: {
		Type: Boolean,
		default: false,
	},
	pageSizing: {
		Type: Boolean,
		default: true,
	},
	pageSizes: {
		Type: Boolean,
		default: [5, 15, 25, 50],
	},
	pageAll: {
		Type: Boolean,
		default: true,
	},
})

// Set options for table using props
const options = {
	size: props.size,
	ids: props.id,
	select: props.select,
	multiselect: props.multiselect,
	selectBoundCheck: props.selectBoundCheck,
	sort: props.sort,
	search: props.search,
	filterSearch: props.filterSearch,
	scroll: props.scroll,
	pages: props.pages,
	pageSizing: props.pageSizing,
	pageSizes: props.pageSizes,
	pageAll: props.pageAll,
}
// Create table as reactive object
const table = reactive(useTable(props.headers, props.parse, props.buttons, props.ignore, props.include, props.filter, options))

// Create reference to tableBody html object
const tableBody = ref()

// Set onSelect callback to emit correct event
table.onSelect.callback((item) => {
	emit("onSelect", item)
})

// Set onMultiselect callback to emit correct event
table.onMultiselect.callback((items) => {
	emit("onMultiselect", items)
})

// If component is mounted set tableData
onMounted(() => {
	table.tableData = props.data ?? []
})
</script>

<style scoped>
.dt-container {
	/*border: 1px solid black;*/
}

.dt-table {
	height: 360px;
}

.dt-table-responsive {
	overflow-y: scroll;
	scrollbar-width: thin;
}

tr.selected {
	background: rgb(173, 173, 173);
}

td {
	/* Disable selection using shift on table content */
	user-select: none; /* CSS3 (little to no support) */
	-ms-user-select: none; /* IE 10+ */
	-moz-user-select: none; /* Gecko (Firefox) */
	-webkit-user-select: none; /* Webkit (Safari, Chrome) */
}
</style>
