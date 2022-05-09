<template>
  <div v-for="item in items" :key="item" class="groupContainer">
    <input :id="item" type="radio" :name="itemCategory" :value="item"  v-model="itemRef">
    <label :for="item"> {{ item }} </label><br>
  </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import { watchEffect } from '@vue/runtime-core'
export default {
  props: {
    items: Array,
    itemCategory: String
  },
  emits: ['toggleBaseLayer', 'togglePopup'],
  setup(props, content) {
    const itemRef = ref(props.items[0])

    watchEffect(()=> {
      content.emit('toggleBaseLayer', {title: itemRef.value})
    })
    watchEffect(()=> {
      content.emit('togglePopup', {title: itemRef.value})
    })

    return { itemRef }
  }
}
</script>

<style>

</style>