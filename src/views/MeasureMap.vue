<template>
  <div id="map" class="map" ref="mapContainer"></div>
  <label for="type">Measurement type:</label>
  <select id="measureType" v-model="measureType" >
    <option value="Length">Length (LineString)</option>
    <option value="Area">Area (Polygon)</option>
  </select>
  <div class="hintMsgContainer" ref="hintMsgContainer"> {{ hintMsg }} </div>
  <input class="optionsInMeasure" type="checkbox" id="segments" checked />
  <label for="segments">Show segment lengths</label>
  <input class="optionsInMeasure" type="checkbox" id="clear" checked />
  <label for="clear">Clear previous measure</label>
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

    const measureLengthOutput = ref(null)
    const measureAreaOutput = ref(null)

    const newOverlayForLength = ref(null)
    const newOverlayForArea = ref(null)

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

    const createNewOverlayforLength = (e) => {
      const newDiv = document.createElement('div')
      newDiv.className = measureLengthOutput.value ? 'ol-tooltip ol-tooltip-measure' : ''
      newOverlayForLength.value = new Overlay({ 
        element: newDiv,
        positioning: 'bottom-right',
        position: e.coordinate,
        offset: [0, -5],
      })
      newDiv.innerHTML = measureLengthOutput.value
      map.value.addOverlay(newOverlayForLength.value)
    }

    const createNewOverlayForArea = (e) => {
      map.value.removeOverlay(newOverlayForArea.value)
      const newAreaDiv = document.createElement('div')
      newAreaDiv.className = 'ol-tooltip ol-tooltip-measure'
      newOverlayForArea.value = new Overlay({
        element: newAreaDiv,
        positioning: 'bottom-right',
        position: e.coordinate,
        offset: [30, 30],
      })
      newAreaDiv.innerHTML = measureAreaOutput.value
      map.value.addOverlay(newOverlayForArea.value)
    }

    function startMeasure(e) {
      sketchToMeasure.value = e.feature.getGeometry();
      listener.value = sketchToMeasure.value.on('change', function (e) {
        const geom = e.target;
        measureLengthOutput.value = formatLength(geom);
        measureAreaOutput.value = formatArea(geom);
      });
    }

    function stopMeasure() {
      sketchToMeasure.value = null
      measureLengthOutput.value = null;
      measureAreaOutput.value = null;
    }

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

      map.value.addOverlay(hintOverlay.value)

      drawLineforMeasurement.on('drawstart', (e) => startMeasure(e));
      drawPolygonforMeasurement.on('drawstart', (e) => startMeasure(e));
      drawLineforMeasurement.on('drawend', () => stopMeasure());
      drawPolygonforMeasurement.on('drawend', () => stopMeasure());

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
        })

        map.value.on('click', (e)=> {
          createNewOverlayforLength(e)
          if (measureType.value==='Area') createNewOverlayForArea(e)
        })
      })
    })

  return { map, mapContainer, measureType, hintMsg, hintMsgContainer, measureAreaOutput }
}
}
</script>

<style>
.map {
  width: 98%;
  height: 600px;
  margin: auto;
}

label {
  font-size: 20px;
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

.optionsInMeasure {
  margin-left: 20px;
}
</style>