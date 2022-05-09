<template>
  <div id="map" class="map" ref="mapContainer"></div>
</template>

<script>
import { shallowRef, onMounted, markRaw } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {OSM} from 'ol/source';
import {Tile as TileLayer} from 'ol/layer';

export default {
  setup() {
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
        }),
      }))
    })


  return { map, mapContainer }
}
}
</script>

<style>
.map {
  width: 98%;
  height: 600px;
  margin: auto;
}
</style>