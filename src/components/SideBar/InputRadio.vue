<template>
  <input :id="layer" type="radio" :name="layerType" :value="layer" :checked="isChecked">
  <label :for="layer">{{ layer }} </label><br>
</template>

<script>
import { ref } from '@vue/reactivity'
import { onMounted } from '@vue/runtime-core'
export default {
  props: {
    layer: String,
    layerType: String
  },
  setup(props) {
    const isChecked = ref(false)

    const displayDefault = ()=>{
      if (props.layer==='OSM Standard') isChecked.value = true
    }

    onMounted(()=>{
      displayDefault()
    })

    return { isChecked }
  }
}
</script>

<style>

</style>