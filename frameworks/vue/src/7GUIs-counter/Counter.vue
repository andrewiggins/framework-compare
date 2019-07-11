<template>
  <div>
    <div>{{ count }}</div>
    <button v-on:click="count += 1">count</button>
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
