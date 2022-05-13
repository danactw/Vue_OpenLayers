<template>
  <div id="map" class="map" ref="mapContainer"></div>
  <select id="measureType" v-model="measureType" >
    <option value="Length">Length (LineString)</option>
    <option value="Area">Area (Polygon)</option>
  </select>
  <div v-html="measureOutput"></div>
</template>

<script>
import { shallowRef, onMounted, markRaw, ref, watchEffect } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM} from 'ol/source';
import { Tile as TileLayer } from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Draw } from 'ol/interaction';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { getLength, getArea } from 'ol/sphere';

export default {
  setup() {
    const mapContainer = shallowRef(null);
    const map = shallowRef(null);
    const measureType = ref('Length')
    const sketchToMeasure = ref(null)
    const measureOutput = ref(null)
    const listener = ref(null)

    const raster = new TileLayer({
      source: new OSM(),
    });

    const source = new VectorSource();

    const vector = new VectorLayer({
      source: source,
      style: new Style({
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
      }),
    });

    const measureStyle = new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2,
      }),
      image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.7)',
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
      }),
    })

    const drawLineforMeasurement = new Draw({
      source: source,
      type: 'LineString',
      style: measureStyle
    })

    const drawPolygonforMeasurement = new Draw({
      source: source,
      type: 'Polygon',
      style: measureStyle
    })

    const formatLength = function (line) {
      const length = getLength(line);
      let output;
      if (length > 100) {
        output = `${Math.round((length / 1000) * 100) / 100} km`;
      } else {
        output = `${Math.round(length * 100) / 100} m`;
      }
      return output;
    };

    const formatArea = function (polygon) {
      const area = getArea(polygon);
      let output;
      if (area > 10000) {
        output = `${Math.round((area / 1000000) * 100) / 100} km<sup>2</sup>`;
      } else {
        output = `${Math.round(area * 100) / 100} m<sup>2</sup>`;
      }
      return output;
    };

    function measure(e) {
      sketchToMeasure.value = e.feature.getGeometry();
      listener.value = sketchToMeasure.value.on('change', function (e) {
        const geom = e.target;
        if (sketchToMeasure.value.getType()==='LineString') measureOutput.value = formatLength(geom);
        else measureOutput.value = formatArea(geom);
      });
    }

    drawLineforMeasurement.on('drawstart', (e)=>measure(e));
    drawPolygonforMeasurement.on('drawstart', (e)=>measure(e));

    onMounted(() => {
      map.value = markRaw(new Map({
        layers: [raster, vector],
        target: 'map',
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      }))

      const removerInteractions = () => {
        map.value.removeInteraction(drawLineforMeasurement)
        map.value.removeInteraction(drawPolygonforMeasurement)        
      }

      watchEffect(()=>{
        removerInteractions()
        switch (measureType.value) {
          case 'Length': 
            map.value.addInteraction(drawLineforMeasurement)
            break;
          case 'Area': 
            map.value.addInteraction(drawPolygonforMeasurement)
            break;
        }
      })
      
    })

  return { map, mapContainer, measureType, measureOutput }
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