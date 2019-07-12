<template>
  <div>
    <button
      class="btn badge"
      style="margin-top: .5rem"
      v-on:click="count += 1"
      v-bind:data-badge="count"
    >count: {{ count }}</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    };
  }
};
</script>
