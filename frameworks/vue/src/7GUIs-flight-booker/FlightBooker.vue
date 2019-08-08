<!--
	Since Vue replaces the element given in el,
	we redefine it here so tests work
-->
<template>
  <div id="app">
    <div class="form-group">
      <label class="form-label" for="trip-type">Trip type</label
      ><select id="trip-type" class="form-select" v-model="tripType">
        <option :value="oneWayFlight">one-way flight</option>
        <option :value="returnFlight">return flight</option>
      </select>
    </div>

    <div class="form-group" v-bind:class="{ 'has-error': departingError }">
      <label class="form-label" for="departing-date">Departing</label
      ><input
        id="departing-date"
        class="form-input"
        type="text"
        v-model="departing"
      />
      <p v-if="departingError" class="form-input-hint">{{ departingError }}</p>
    </div>

    <div class="form-group" v-bind:class="{ 'has-error': returningError }">
      <label class="form-label" for="returning-date">Returning</label
      ><input
        id="returning-date"
        class="form-input"
        type="text"
        v-model="returning"
        v-bind:disabled="tripType == oneWayFlight"
      />
      <p v-if="returningError" class="form-input-hint">{{ returningError }}</p>
    </div>

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
