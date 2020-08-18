<template>
	<div class="form-group">
		<label class="form-label" for="trip-type">Trip type</label
		><select
			id="trip-type"
			class="form-select"
			v-on:input="e => listeners.setTripType(e.target.value)"
		>
			<option value="one-way">one-way flight</option>
			<option value="return">return flight</option>
		</select>
	</div>
</template>

<script>
export default {};
</script>
