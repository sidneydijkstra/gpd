import { reactive, ref, watch } from "vue"
import useCallback from "@/composables/useCallback.js"

// Default config for table
const defaultOptions = {
	size: 5, // size of table
	ids: false, // enable item ids beside item
	select: false, // enable selecting of item
	multiselect: false, // enable multiselect of multiple items (must have select enabled)
	selectBoundCheck: true, // enable the boundary check for disabling the select when the user clicks outside the table
	sort: false, // enable sorting of items
	search: false, // enable searching items
	filterSearch: false, // enable filtered search from item values
	scroll: false, // enable scrolling (overwrites pages)
	pages: false, // enable pages and paginator
	pageSizing: true, // enable page sizing
	pageSizes: [5, 15, 25, 50], // size options for paged table
	pageAll: true, // enable all page that shows all items
}

export default function useTable(headers, parse = {}, buttons = [], ignore = [], include = [], filter = (value) => true, options = defaultOptions) {
	// Public - unchangeable
	const tableOptions = {
		size: options?.size ?? defaultOptions.size,
		ids: options?.ids ?? defaultOptions.ids,
		select: options?.select ?? defaultOptions.select,
		multiselect: options?.multiselect ?? defaultOptions.multiselect,
		selectBoundCheck: options?.selectBoundCheck ?? defaultOptions.selectBoundCheck,
		sort: options?.sort ?? defaultOptions.sort,
		search: options?.search ?? defaultOptions.search,
		filterSearch: options?.filterSearch ?? defaultOptions.filterSearch,
		scroll: options?.scroll ?? defaultOptions.scroll,
		pages: options?.pages ?? defaultOptions.pages,
		pageSizing: options?.pageSizing ?? defaultOptions.pageSizing,
		pageSizes: options?.pageSizes ?? defaultOptions.pageSizes,
		pageAll: options?.pageAll ?? defaultOptions.pageAll,
	}
	// Private
	const content = ref([])
	const intactContent = ref([])
	// Public - changeable
	const tableData = ref([])
	const tableSize = ref(tableOptions.size)
	const tableSearch = ref("")
	// Public - unchangeable
	const isLoading = ref(true)
	const tableHeaders = ref([])
	const tableContent = ref([])
	const tableButtons = ref([])
	const tableIntactContent = ref([])
	const tableMaxPage = ref(0)
	const tableCurrentPage = ref(0)
	const tableMaxSize = ref(0)
	const tableSearchFilter = ref([])
	const tableCurrentSort = ref(null)
	const tableSortStates = ref([])

	const tableSelectIndex = ref(-1)
	const tableLastSelectIndex = ref(-1)

	const onSelect = reactive(useCallback())
	const onMultiselect = reactive(useCallback())

	// Watch when user changes data
	watch(
		() => [...tableData.value],
		async (nTableData) => {
			isLoading.value = true
			initTable()
			isLoading.value = false
		}
	)
	watch(tableSize, async (nTableSize) => {
		isLoading.value = true
		reloadTable()
		isLoading.value = false
	})
	watch(tableSearch, async (nTableSearch) => {
		isLoading.value = true
		reloadTable()
		isLoading.value = false
	})
	watch(
		() => [...tableSearchFilter.value],
		async (nTableSearchFilter) => {
			isLoading.value = true
			reloadTable()
			isLoading.value = false
		}
	)

	function initTable() {
		// Check if tableOptions contains valid data object
		if (tableData.value == null || tableData.value.length <= 0) return

		// Check if table data is not an object and map it to a valid notation
		if((typeof tableData.value[0] !== 'object'))
			tableData.value = tableData.value.map(x => {return {none: x}})

		// Set header values
		tableHeaders.value = Object.keys(tableData.value[0]).filter((x) => {
			// Check if value needs to be ignored
			if(ignore.includes(x))
				return false
			
			// Check if include needs to be includes
			if(include.length > 0)
				return include.includes(x)

			return true
		})

		// Update header based on user values
		for (let i = 0; i < tableHeaders.value.length; i++) {
			if(headers.length <= i)
				break
			
			tableHeaders.value[i] = headers[i]
		}

		// Initialize and add buttons
		tableButtons.value = []
		if(Array.isArray(buttons)) {
			for (let i = 0; i < buttons.length; i++) {
				tableHeaders.value.push(buttons[i].header)
				tableButtons.value.push(buttons[i])
			}
		} else {
			tableHeaders.value.push(buttons.header)
			tableButtons.value.push(buttons)
		}
		

		// Set sort state of headers
		tableSortStates.value = Array(tableHeaders.value.length).fill(0, 0)

		// Call reloadTable function ro prepare the data
		reloadTable()
	}

	function reloadTable() {
		// Check if tableData contains valid data object
		if (tableData.value == null || tableData.value.length <= 0) return

		// This for loop will fill this
		// content array with the values inside tableData
		// by extracting them into an array like:
		// object: { 'item1': 'value1', 'item2': 'value2'}
		// array: [value1, value2]
		// Create content and intact content array
		content.value = []
		intactContent.value = []
		for (let i = 0; i < tableData.value.length; i++) {
			// If filter is function and returns false continue loop
			if(filter instanceof Function && !filter(tableData.value[i]))
				continue

			// Get keys and values of object
			var keys = Object.keys(tableData.value[i])
			var values = Object.values(tableData.value[i])

			// Create result object
			var result = []
			// Create search bool
			let valueInSearch = false
			// Loop for all variables inside object
			for (let j = 0; j < keys.length; j++) {
				// Check if value needs to be ignored
				if (ignore.includes(keys[j])) continue

				// Check if include contains any values and if value is included 
				if(include.length > 0 && !include.includes(keys[j])) continue

				// Parse value
				let parsedValue = parseValue(keys[j], values[j])
				// Add parsed value to result array
				result.push(parsedValue)

				// Check if filter is filled and key is in filter array
				if (tableSearchFilter.value.length > 0 && !tableSearchFilter.value.includes(String(keys[j]))) continue

				// Check if value inside search string
				if (String(parsedValue).includes(tableSearch.value)) valueInSearch = true
			}

			// Check if array did not have valid search
			if (!valueInSearch) continue

			// Add array to content array
			content.value.push(result)
			// Add object to intact content array
			intactContent.value.push(tableData.value[i])
		}

		// Set table max size
		tableMaxSize.value =
			content.value.length < tableSize.value || tableOptions.scroll ? content.value.length : tableSize.value
		// Calculate page size
		tableMaxPage.value = Math.ceil(content.value.length / tableMaxSize.value) - 1
		// Clear select values
		tableSelectIndex.value = -1
		tableLastSelectIndex.value = -1
		// Sort the table with current sort value
		sortTable(tableCurrentSort.value)
		// Navigate the table to page 0
		navigateTable(0)
	}

	function parseValue(header, value) {
		// Get keys and values of parse object
		var keys = Object.keys(parse)
		var functions = Object.values(parse)

		// Loop for all variables inside parse object
		for (let i = 0; i < keys.length; i++) {
			// Check if key is not header
			if (keys[i] != header) continue

			// Return parsed value
			return functions[i] ? functions[i](value) : value
		}

		return value
	}

	function sortTable(index) {
		// Check if index is valid
		if (index == null) return

		// Set current sort value to index
		tableCurrentSort.value = index

		// Check if current sorting state is 0, then
		if (tableSortStates.value[index] == 0) return

		// Sort function for array todo: move this function (use class extensions from ES6?)
		function arraySortByIndex(array, i) {
			return array.slice(0).sort(function (a, b) {
				return a[i] > b[i] ? tableSortStates.value[index] : a[i] < b[i] ? -tableSortStates.value[index] : 0
			})
		}
		function arraySortByHeader(array, h) {
			return array.slice(0).sort(function (a, b) {
				return a[h] > b[h] ? tableSortStates.value[index] : a[h] < b[h] ? -tableSortStates.value[index] : 0
			})
		}

		// Sort content copy array from current header index
		content.value = arraySortByIndex([...content.value], index)
		intactContent.value = arraySortByHeader([...intactContent.value], tableHeaders.value[index])
	}

	function navigateTable(pageIndex) {
		// Set current page
		tableCurrentPage.value = pageIndex > tableMaxPage.value ? tableMaxPage.value : pageIndex < 0 ? 0 : pageIndex
		// Set table content
		tableContent.value = content.value.slice(
			tableMaxSize.value * tableCurrentPage.value,
			tableMaxSize.value * (tableCurrentPage.value + 1)
		)
		tableIntactContent.value = intactContent.value.slice(
			tableMaxSize.value * tableCurrentPage.value,
			tableMaxSize.value * (tableCurrentPage.value + 1)
		)
	}

	// Select function created for user
	function select(index) {
		// Check if select is enabled
		if (!tableOptions.select) return

		// Set last index to -1 to clear a multiselect
		tableLastSelectIndex.value = -1
		// Set current index to received index
		tableSelectIndex.value = index

		// Get intact object from array
		let item = tableIntactContent.value[index]
		// Call the onSelect callback using the invoke function
		onSelect.invoke(item)
	}

	// Multiselect function created for user
	function multiselect(index) {
		// Check if multiselect is enabled
		if (!tableOptions.multiselect) return

		// Set last select index
		tableLastSelectIndex.value = index
		// Check if both last and current select indexes are equal to -1
		if (tableLastSelectIndex.value == -1 || tableSelectIndex.value == -1) return

		// Calculate from and to index, we must use the array.slice function
		// using slice(lowValue, highValue) or else this call fails
		let fromIndex =
			tableLastSelectIndex.value < tableSelectIndex.value ? tableLastSelectIndex.value : tableSelectIndex.value
		let toIndex =
			tableLastSelectIndex.value < tableSelectIndex.value ? tableSelectIndex.value : tableLastSelectIndex.value
		// If fromIndex and to Index are equal we return this value as an array
		let items =
			fromIndex != toIndex
				? tableIntactContent.value.slice(fromIndex, toIndex + 1)
				: [tableIntactContent.value[toIndex]]

		// Call the onMultiselect callback using the invoke function
		onMultiselect.invoke(items)
	}

	// Function for user to unselect a item(s)
	function unselect() {
		// Check if boundary check is enabled
		if(!tableOptions.selectBoundCheck)
			return

		// Set last index to -1 to clear a multiselect
		tableLastSelectIndex.value = -1
		// Set current index to -1 to clear select
		tableSelectIndex.value = -1
	}

	// Function for user to check if an index is inside the multiselect
	// this is done because this can be a hassle to create
	function isIndexInMultiselect(index) {
		if (tableLastSelectIndex.value == -1 || tableSelectIndex.value == -1) return false

		// Calculate from and to index
		let fromIndex =
			tableLastSelectIndex.value < tableSelectIndex.value ? tableLastSelectIndex.value : tableSelectIndex.value
		let toIndex =
			tableLastSelectIndex.value < tableSelectIndex.value ? tableSelectIndex.value : tableLastSelectIndex.value

		return fromIndex <= index && toIndex >= index
	}

	// Navigate function created for user
	function navigate(page) {
		navigateTable(page)
	}

	// Sort function created for by user
	function sort(index) {
		// Set state of current sorting header
		tableSortStates.value[index] = tableSortStates.value[index] == 0 ? -1 : tableSortStates.value[index] == -1 ? 1 : 0
		// Sort table
		sortTable(index)
		// Navigate the table to page 0
		navigateTable(0)
	}

	return {
		tableData,
		tableSize,
		tableSearch,
		tableHeaders,
		tableContent,
		tableButtons,
		tableIntactContent,
		tableMaxPage,
		tableCurrentPage,
		tableMaxSize,
		tableSearchFilter,
		tableCurrentSort,
		tableSortStates,
		tableOptions,
		tableSelectIndex,
		tableLastSelectIndex,
		onSelect,
		onMultiselect,
		isLoading,
		select,
		multiselect,
		unselect,
		isIndexInMultiselect,
		navigate,
		sort,
	}
}
