<template>
  <nav>
    <router-link to="/">Home</router-link> |
  </nav>
  <div class="gridContainer">
    <div class="grid1">
      <div class="sidebar">
        <h2 @click="toggleLayerBtn=!toggleLayerBtn">Base Layer</h2>
        <div v-show="toggleLayerBtn" v-for="layer in layerGroup" :key="layer">
          <InputRadio :layer="layer" layerType="baseLayer"/>
        </div>
        <h2 @click="toggleOptionBtn=!toggleOptionBtn">Layers</h2>
        <div v-show="toggleOptionBtn" v-for="layer in optionalLayers" :key="layer">
          <InputCheckbox :layer="layer" layerType="optionalLayer" />
        </div>        
        <h2 @click="toggleControlBtn=!toggleControlBtn"  >Controls</h2>
        <div v-show="toggleControlBtn" v-for="control in mapControls" :key="control">
          <InputCheckbox :layer="control" layerType="mapControl" />
        </div>
      </div>
    </div>
    <div class="grid2">
      <router-view />
    </div>
  </div>
</template>

<script>
import { ref } from '@vue/reactivity';
import InputCheckbox from "./components/SideBar/InputCheckbox.vue";
import InputRadio from './components/SideBar/InputRadio.vue';

export default {
  components: { InputCheckbox, InputRadio },
  setup() {
    const toggleLayerBtn = ref(false)
    const toggleOptionBtn = ref(false)
    const toggleControlBtn = ref(false)

    const layerGroup = ['OSM Standard', 'OSM Humanitarian', 'Bing Map', 'CartoDB Base', 'Stamen Water']

    const optionalLayers = [ 'Tile Debug', 'Tile ArcGIS' ]

    const mapControls = ['attribution', 'fullScreen', 'mousePosition', 'overviewMap', 'scaleLine', 'zoomSlider', 'zoomExtent']

    return { toggleLayerBtn, toggleOptionBtn, toggleControlBtn, layerGroup, optionalLayers, mapControls }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.gridContainer {
  display: grid;
  grid-template-columns: 20vw 80vw;
  grid-template-rows: 85vh;
  overflow: hidden;
}

.sidebar {
  margin-left: 30px;
  height: 80vh;
  overflow: scroll;
}

.sidebar div{
  text-align: start;
  padding: 10px;
}

.sidebar h2:hover{
  transform: translateY(1px);
  cursor: pointer;
}
</style>
