import Vue from "vue";
import App from "./Timer.vue";

new Vue({
	el: "#app",
	components: { App },
	render(createElement) {
		return createElement(App);
	}
});
