<template>
  <button class="customizedBtn"> {{ action }} </button>
</template>

<script>
export default {
  props: {
    action: String
  }
}
</script>

<style>
.customizedBtn {
  margin: 10px;
}
</style>