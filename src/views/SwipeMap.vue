<template>
  <div id="map" class="map" ref="mapContainer"></div>
  <input id="swipe" type="range" style="width: 100%" v-model="swipe">
</template>

<script>
import { shallowRef, onMounted, markRaw, ref, watch } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {OSM} from 'ol/source';
import { Tile as TileLayer } from 'ol/layer';
import { getRenderPixel } from 'ol/render';

export default {
  setup() {
    const mapContainer = shallowRef(null);
    const map = shallowRef(null);
    const swipe = ref(50)

    const OSMHumanitarian = new TileLayer({
      source: new OSM({
        url: "https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        maxZoom: 20,
      }),
    });

    OSMHumanitarian.on('prerender', function (event) {
      const ctx = event.context;
      const mapSize = map.value.getSize();
      const width = mapSize[0] * (swipe.value / 100);
      const topLeft = getRenderPixel(event, [width, 0]);
      const topRight = getRenderPixel(event, [mapSize[0], 0]);
      const bottomLeft = getRenderPixel(event, [width, mapSize[1]]);
      const bottomRight = getRenderPixel(event, mapSize);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(topLeft[0], topLeft[1]);
      ctx.lineTo(bottomLeft[0], bottomLeft[1]);
      ctx.lineTo(bottomRight[0], bottomRight[1]);
      ctx.lineTo(topRight[0], topRight[1]);
      ctx.closePath();
      ctx.clip();
    });

    OSMHumanitarian.on('postrender', function (event) {
      const ctx = event.context;
      ctx.restore();
    });

    onMounted(() => {
      map.value = markRaw(new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          OSMHumanitarian
        ],
        target: 'map',
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      }))

      const listener = function () {
        map.value.render();
      };

      watch(() => swipe.value, listener)

    })


  return { map, mapContainer, swipe }
}
}
</script>

<style>
</style>