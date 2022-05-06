<template>
  <input :id="layer" type="radio" :name="layerType" :value="layer" :checked="isChecked" v-model="layerRef">
  <label :for="layer"> {{ layer }} </label><br>
</template>

<script>
import { ref } from '@vue/reactivity'
import {  onMounted, watchEffect } from '@vue/runtime-core'
export default {
  props: {
    layer: String,
    layerType: String
  },
  emits: ['toggleBaseLayer'],
  setup(props, content) {
    const isChecked = ref(false)
    const layerRef = ref('')

    const displayDefault = ()=>{
      if (props.layer==='OSM Standard') {
        isChecked.value = true
        layerRef.value = 'OSM Standard'
      }
    }

    onMounted(()=>{
      displayDefault()
    })

    watchEffect(()=> {
      content.emit('toggleBaseLayer', {show: isChecked.value, title: props.layer, name: layerRef.value})
    })

    return { isChecked, layerRef }
  }
}
</script>

<style>

</style>