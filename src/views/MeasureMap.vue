<template>
  <div id="map" class="map" ref="mapContainer"></div>
  <select id="measureType" v-model="measureType" >
    <option value="Length">Length (LineString)</option>
    <option value="Area">Area (Polygon)</option>
  </select>
  <div class="hintMsgContainer" ref="hintMsgContainer"> {{ hintMsg }} </div>
  <div class="measureOutputMsgContainer" ref="measureOutputMsgContainer" v-html="measureOutput"> </div>
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
import Overlay from 'ol/Overlay';
// import { unByKey } from 'ol/Observable';

export default {
  setup() {
    const mapContainer = shallowRef(null);
    const map = shallowRef(null);

    const measureType = ref('Length')
    const sketchToMeasure = ref(null)
    const listener = ref(null)

    const startDrawingMsg = 'Click to start drawing'
    const continueLineMsg = 'Click to continue drawing the line';
    const continuePolygonMsg = 'Click to continue drawing the polygon';
    const hintMsgContainer = ref(null)
    const hintOverlay = ref(null)
    const hintMsg = ref(startDrawingMsg)

    const measureOutputMsgContainer = ref(null)
    const measureOutputOverlay = ref(null)
    const measureOutput = ref(null)

    const newOverlay = ref([])

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

    const createNewOverlay = (e) => {
      const newDiv = document.createElement('div')
      newDiv.className = measureOutput.value ? 'ol-tooltip ol-tooltip-measure' : ''
      newOverlay.value = new Overlay({ 
        element: newDiv,
        positioning: 'bottom-right',
        position: e.coordinate,
        offset: [0, -5],
      })
      newDiv.innerHTML = measureOutput.value
      map.value.addOverlay(newOverlay.value)
    }

    drawLineforMeasurement.on('drawstart', (e)=>measure(e));
    drawPolygonforMeasurement.on('drawstart', (e)=>measure(e));
    // drawPolygonforMeasurement.on('drawend', ()=>{
    //   unByKey(listener.value)
    // });

    onMounted(() => {
      map.value = markRaw(new Map({
        layers: [raster, vector],
        target: 'map',
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      }))

      // Overlay
      hintOverlay.value = new Overlay({ 
        element: hintMsgContainer.value,
        positioning: 'center-left',
        offset: [15, 0]
      }) 

      measureOutputOverlay.value = new Overlay({ 
        element: measureOutputMsgContainer.value,
        positioning: 'bottom-right',
        offset: [0, -5],
      }) 

      map.value.addOverlay(hintOverlay.value)
      map.value.addOverlay(measureOutputOverlay.value)

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
        map.value.on('pointermove', (e) => {
          const currentCoord = e.coordinate
          hintOverlay.value.setPosition(currentCoord)
          if (sketchToMeasure.value) {
            switch (measureType.value) {
              case 'Length': 
                hintMsg.value = continueLineMsg
                break;
              case 'Area': 
                hintMsg.value = continuePolygonMsg
                break;
            }
          } else {
            hintMsg.value = startDrawingMsg
          }
          measureOutputOverlay.value.setPosition(currentCoord)
        })
        map.value.on('click', e => createNewOverlay(e))
      })
      
    })

  return { map, mapContainer, measureType, measureOutput, hintMsg, hintMsgContainer, measureOutputMsgContainer }
}
}
</script>

<style>
.map {
  width: 98%;
  height: 600px;
  margin: auto;
}
.ol-tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.7;
  white-space: nowrap;
  font-size: 12px;
  cursor: default;
  /* user-select: none; */
}
.ol-tooltip-measure {
  opacity: 1;
  font-weight: bold;
}
.ol-tooltip-static {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
}
.ol-tooltip-measure:before,
.ol-tooltip-static:before {
  border-top: 6px solid rgba(0, 0, 0, 0.5);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: "";
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}
.ol-tooltip-static:before {
  border-top-color: #ffcc33;
}
</style>