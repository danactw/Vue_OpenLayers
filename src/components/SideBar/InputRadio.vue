<template>
  <div v-for="layer in layerGroup" :key="layer" class="groupContainer">
    <input :id="layer" type="radio" name="baseLayer" :value="layer"  v-model="layerRef">
    <label :for="layer"> {{ layer }} </label><br>
  </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import { watchEffect } from '@vue/runtime-core'
export default {
  props: {
    layerGroup: Array
  },
  emits: ['toggleBaseLayer'],
  setup(props, content) {
    const layerRef = ref('OSM Standard')

    watchEffect(()=> {
      content.emit('toggleBaseLayer', {title: layerRef.value})
    })

    return { layerRef }
  }
}
</script>

<style>

</style>