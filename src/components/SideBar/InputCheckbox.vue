<template>
  <input :id="layer" type="checkbox" :name="layerType" :value="layer" :checked="isChecked" v-model="isChecked">
  <label :for="layer">{{ layer }} </label><br>
</template>

<script>
import { ref } from '@vue/reactivity'
import { watchEffect } from '@vue/runtime-core'

export default {
  props: {
    layer: String,
    layerType: String
  },
  emits: ['toggleOptionalLayer'],
  setup(props, content) {
    const isChecked = ref(false)

    watchEffect(()=>{
      content.emit('toggleOptionalLayer', {show: isChecked.value, title: props.layer})
    })

    return { isChecked }
  }
}
</script>

<style>

</style>