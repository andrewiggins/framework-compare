<template>
	<button
		class="btn badge"
		style="margin-top: 0.5rem"
		v-on:click="count += 1"
		v-bind:data-badge="count"
	>
		count: {{ count }}
	</button>
</template>

<script>
export default {
	data() {
		return {
			count: 0
		};
	}
};
</script>
