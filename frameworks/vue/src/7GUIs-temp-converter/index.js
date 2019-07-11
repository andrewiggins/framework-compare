import Vue from "vue";
import App from "./TempConv.vue";

new Vue({
	el: "#app",
	components: { App },
	render(createElement) {
		return createElement(App);
	}
});
