<template>
  <div id="map" class="map" ref="mapContainer"></div>
  <label for="type">Measurement type:</label>
  <select id="measureType" v-model="measureType" >
    <option value="Length">Length (LineString)</option>
    <option value="Area">Area (Polygon)</option>
  </select>
</template>

<script>
import { shallowRef, onMounted, markRaw, ref, computed, watchEffect } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {OSM} from 'ol/source';
import {Tile as TileLayer} from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Draw } from 'ol/interaction';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { Point } from 'ol/geom';

export default {
  setup() {
    const mapContainer = shallowRef(null);
    const map = shallowRef(null);

    const measureType = ref('Length')
    const drawType = computed(() => measureType.value === 'Length' ? 'LineString' : 'Polygon')

    const style = new Style({
      text: new Text({
        font: '14px Calibri,sans-serif',
        fill: new Fill({
          color: 'rgba(255, 255, 255, 1)',
        }),
        backgroundFill: new Fill({
          color: 'rgba(0, 0, 0, 0.7)',
        }),
        padding: [3, 3, 3, 3],
        textBaseline: 'bottom',
        offsetY: -15,
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2,
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#ffcc33',
        }),
      }),
    })

    const styleFunction = (feature) => {
      const styles = [style]
      const geometry = feature.getGeometry();
      const type = geometry.getType();
      const point = new Point(geometry.getLastCoordinate())
      switch (drawType.value) {
        case 'LineString':
          switch (type) {
            case 'Point':
              style.getText().setText('Drawing')
              break;
            case 'LineString':
              console.log(point);
              // style.setGeometry(point)
              style.getText().setText('')
              break;
          }
          break;
        case 'Polygon':
          switch (type) {
            case 'Point':
              style.getText().setText('')
              break;
            case 'LineString':
              style.getText().setText('Line')
              break;
            case 'Polygon':
              style.getText().setText('Polygon')
              break;
          }
          break;
      }
      return styles
    }


    const source = new VectorSource();

    const vector = new VectorLayer({
      source: source,
      style: style
    });

    const drawLine = new Draw({
      source: source,
      type: 'LineString',
      style: styleFunction
    })

    const drawPolygon = new Draw({
      source: source,
      type: 'Polygon',
      style: styleFunction
    })

    onMounted(() => {
      map.value = markRaw(new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          vector
        ],
        target: 'map',
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      }))

      watchEffect(() => {
        map.value.removeInteraction(drawLine)
        map.value.removeInteraction(drawPolygon)
        switch (drawType.value) {
          case 'LineString' :
            map.value.addInteraction(drawLine)
            break;
          case 'Polygon' :
            map.value.addInteraction(drawPolygon)
            break;
        }
      })
    })


  return { map, mapContainer, measureType }
}
}
</script>

<style>
</style>