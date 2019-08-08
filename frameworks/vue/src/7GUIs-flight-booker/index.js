import Vue from "vue";
import FlightBooker from "./FlightBooker.vue";

new Vue({
	el: "#app",
	components: { FlightBooker },
	render(createElement) {
		return createElement(FlightBooker);
	}
});
