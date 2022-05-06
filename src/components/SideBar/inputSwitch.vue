<template>
  <div class="switch">
    <input :id="control" type="checkbox" :name="controlType" :value="control" :checked="isChecked" v-model="isChecked">
    <span class="slider round" @click="toggleSwitch"></span>
    <label :for="control"> {{ control }} </label>
  </div>

</template>

<script>
import { ref } from '@vue/reactivity'
import { watchEffect } from '@vue/runtime-core'
export default {
  props: {
    control: String,
    controlType: String
  },
  setup(props, content) {
    const isChecked = ref(true)

    const toggleSwitch = () => {
      isChecked.value = !isChecked.value
    }

    watchEffect(()=>{
      content.emit('toggleMapControl', {show: isChecked.value, title: props.control})
    })

    return { isChecked, toggleSwitch }
  }
}
</script>

<style>
.switch {
  display: flex;
  align-items: center;
}


.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  display: inline-block;
  position: relative;
  cursor: pointer;
  width: 40px;
  height: 20px;
  border-radius: 34px;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
  margin-right: 10px;
  margin-left: 0;
}

.slider:before {
  position: absolute;
  content: "";
  height: 15px;
  width: 15px;
  left: 3px;
  bottom: 3px;
  border-radius: 50%; 
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(19px);
  -ms-transform: translateX(19px);
  transform: translateX(19px);
}
</style>