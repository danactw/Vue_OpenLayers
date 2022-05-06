<template>
  <input :id="layer" type="checkbox" :name="layerType" :value="layer">
  <label :for="layer">{{ layer }} </label><br>
</template>

<script>

export default {
  props: {
    layer: String,
    layerType: String
  },
  setup() {
  }
}
</script>

<style>

</style>