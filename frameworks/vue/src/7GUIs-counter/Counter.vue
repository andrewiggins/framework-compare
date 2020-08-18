<!--
	Since Vue replaces the element given in el,
	we redefine it here so tests work
-->
<template>
	<div id="app">
		<button
			class="btn badge"
			style="margin-top: 0.5rem;"
			v-on:click="count += 1"
			v-bind:data-badge="count"
		>
			count: {{ count }}
		</button>
	</div>
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
