<template>
	<label>
		Elapsed time: <progress v-bind:value="elapsed / duration"></progress>
	</label>
	<div class="elapsed">{{ elapsedFormatted }}</div>
	<label>
		Duration:
		<input type="range" v-model="duration" min="1" max="20000" />
	</label>
	<div>
		<button class="btn btn-primary" v-on:click="reset">Reset</button>
	</div>
</template>

<script>
export default {
	data() {
		return {
			elapsed: 0,
			duration: 5000,
			last_time: performance.now(),
			frame: null
		};
	},
	computed: {
		elapsedFormatted() {
			return (this.elapsed / 1000).toFixed(1) + "s";
		}
	},
	watch: {
		duration: "requestFrame",
		elapsed: "requestFrame"
	},
	methods: {
		reset() {
			this.elapsed = 0;
			this.last_time = performance.now();
		},
		requestFrame() {
			if (this.elapsed < this.duration) {
				this.frame = requestAnimationFrame(time => {
					this.elapsed += Math.min(
						time - this.last_time,
						this.duration - this.elapsed
					);
					this.last_time = time;
				});
			}
		}
	},
	mounted() {
		this.requestFrame();
	},
	beforeDestroy() {
		cancelAnimationFrame(this.frame);
	}
};
</script>
