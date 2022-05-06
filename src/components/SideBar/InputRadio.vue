<template>
  <input :id="layer" type="radio" :name="layerType" :value="layer">
  <label :for="layer">{{ layer }} </label><br>
</template>

<script>
export default {
  props: {
    layer: String,
    layerType: String
  }
}
</script>

<style>

</style>