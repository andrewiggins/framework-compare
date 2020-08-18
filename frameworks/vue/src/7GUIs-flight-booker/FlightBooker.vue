<!--
	Since Vue replaces the element given in el,
	we redefine it here so tests work
-->
<template>
	<div id="app">
		<TripType
			tripType="{tripType}"
			v-on:setTripType="newTripType => (tripType = newTripType)"
		/>

		<DateEntry
			label="Departing"
			v-bind:date="departing"
			v-bind:errorMsg="departingError"
			v-on:setDate="newDate => (departing = newDate)"
		/>

		<DateEntry
			label="Returning"
			v-bind:date="returning"
			v-bind:errorMsg="returningError"
			v-on:setDate="newDate => (returning = newDate)"
			v-bind:disabled="tripType == oneWayFlight"
		/>

		<div class="form-group">
			<button
				class="btn btn-primary"
				v-on:click="bookFlight"
				v-bind:disabled="isBookDisabled"
			>
				book
			</button>
		</div>
	</div>
</template>

<script>
import { today, validateDate } from "../../../../lib/date";
import TripType from "./TripType.vue";
import DateEntry from "./DateEntry.vue";

const oneWayFlight = "one-way";
const returnFlight = "return";

function getErrorMessage(date) {
	try {
		validateDate(date);
		return null;
	} catch (error) {
		return error.message;
	}
}

export default {
	components: { TripType, DateEntry },
	data() {
		let currentDate = today();

		return {
			oneWayFlight,
			returnFlight,
			tripType: oneWayFlight,
			departing: currentDate,
			returning: currentDate
		};
	},
	methods: {
		bookFlight() {
			const type = this.tripType == returnFlight ? "return" : "one-way";

			let message = `You have booked a ${type} flight, leaving ${this.departing}`;
			if (type === "return") {
				message += ` and returning ${this.returning}`;
			}

			alert(message);
		}
	},
	computed: {
		departingError() {
			return getErrorMessage(this.departing);
		},
		returningError() {
			let returningError = getErrorMessage(this.returning);
			if (
				this.departingError == null &&
				returningError == null &&
				this.tripType == returnFlight &&
				this.returning < this.departing
			) {
				returningError = "Returning date must be on or after departing date.";
			}

			return returningError;
		},
		isBookDisabled() {
			return this.departingError || this.returningError;
		}
	}
};
</script>
