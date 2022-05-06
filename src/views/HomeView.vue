<template>
  <div id="map" class="map" ref="mapContainer"></div>
</template>

<script>
import { shallowRef, onMounted, onUnmounted, markRaw } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import View from 'ol/View';

export default {
  name: "HomeView",
  setup () {
    const mapContainer = shallowRef(null);
    const map = shallowRef(null);

    onMounted(() => {
      map.value = markRaw(new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          })
        ],
        target: 'map',
        view: new View({
          center: [0, 0],
          zoom: 2,
          constrainRotation: 16,
        }),
      }));

    }),
    onUnmounted(() => {
      map.value?.remove();
    })

    return {
      map, mapContainer
    };
  }
};
</script>

<style>
.map {
  position: absolute;
  width: 100%;
  height: 80%;
}
</style>
