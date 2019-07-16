<!-- Since Vue replaces the element given in el, we redefine it here so tests work -->
<template>
  <div id="app">
    <input v-model.number="cFormatted" type="number" /> °c =
    <input v-model.number="fFormatted" type="number" /> °f
  </div>
</template>

<script>
export default {
  data() {
    return {
      c: "",
      f: ""
    };
  },
  computed: {
    cFormatted: {
      get() {
        return this.c !== "" ? +this.c.toFixed(1) : "";
      },
      set(c) {
        this.c = c;
        this.f = +(32 + (9 / 5) * c);
      }
    },
    fFormatted: {
      get() {
        return this.f !== "" ? +this.f.toFixed(1) : "";
      },
      set(f) {
        this.f = f;
        this.c = +((5 / 9) * (f - 32));
      }
    }
  }
};
</script>
