<template functional>
	<div class="form-group" v-bind:class="{ 'has-error': props.errorMsg }">
		<label class="form-label" v-bind:for="props.label + '-date'">{{
			props.label
		}}</label
		><input
			v-bind:id="props.label + '-date'"
			class="form-input"
			type="text"
			v-bind:value="props.date"
			v-on:input="e => listeners.setDate(e.target.value)"
			v-bind:disabled="props.disabled || false"
		/>
		<p v-if="props.errorMsg" class="form-input-hint">{{ props.errorMsg }}</p>
	</div>
</template>
