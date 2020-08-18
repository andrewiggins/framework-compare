<template>
	<div class="form-group" v-bind:class="{ 'has-error': errorMsg }">
		<label class="form-label" v-bind:for="label + '-date'">{{ label }}</label
		><input
			v-bind:id="label + '-date'"
			class="form-input"
			type="text"
			v-bind:value="date"
			v-on:input="e => listeners.setDate(e.target.value)"
			v-bind:disabled="disabled || false"
		/>
		<p v-if="errorMsg" class="form-input-hint">{{ errorMsg }}</p>
	</div>
</template>

<script>
export default {
	props: ["errorMsg", "label", "date", "disabled"]
};
</script>
