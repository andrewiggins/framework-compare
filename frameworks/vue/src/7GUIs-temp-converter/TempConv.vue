<template>
  <div>
    <input v-model.number="c" type="number" /> °c =
    <input v-model.number="f" type="number" /> °f
  </div>
</template>

<script>
export default {
  data() {
    return {
      c: null,
      f: null
    };
	},
	watch: {
		c(c) {
			this.f = +(32 + (9 / 5) * c).toFixed(1);
		},
		f(f) {
			this.c = +((5 / 9) * (f - 32)).toFixed(1);
		}
	}
};
</script>
