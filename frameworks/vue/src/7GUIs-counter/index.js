import Vue from "vue";
import Counter from "./Counter.vue";

new Vue({
	el: "#app",
	components: { Counter },
	render(createElement) {
		return createElement(Counter);
	}
});
