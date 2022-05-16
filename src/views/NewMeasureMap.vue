<template>
  <div id="map" class="map" ref="mapContainer"></div>
  <label for="type">Measurement type:</label>
  <select id="measureType" v-model="measureType" >
    <option value="LineString">Length (LineString)</option>
    <option value="Polygon">Area (Polygon)</option>
  </select>
  <div class="hintMsgContainer" ref="hintMsgContainer"> {{ hintMsg }} </div>
  <input class="optionsInMeasure" type="checkbox" id="segments" value="showSegments" v-model="showSegments" />
  <label for="segments">Show segment lengths</label>
  <input class="optionsInMeasure" type="checkbox" id="clear" value="clearPrevious" v-model="clearPrevious"/>
  <label for="clear">Clear previous measure</label>
</template>

<script>
import { shallowRef, onMounted, markRaw, ref, computed, watch } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM } from 'ol/source';
import { Tile as TileLayer } from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Draw } from 'ol/interaction';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
// import { LineString, Point } from 'ol/geom';
// import { getLength, getArea } from 'ol/sphere';

export default {
  setup() {
    const mapContainer = shallowRef(null);
    const map = shallowRef(null);

    const measureType = ref('LineString')
    const showSegments = ref(true)
    const clearPrevious = ref(true)
    const startDrawingMsg = 'Click to start measuring'
    const continueMsg = computed(()=>`Click to continue drawing ${measureType.value}`);
    const hintMsgContainer = ref(null)
    const hintMsg = ref(startDrawingMsg)

    const style = new Style({
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

    const hintStyle = new Style({
      text: new Text({
        font: '12px Calibri,sans-serif',
        fill: new Fill({
          color: 'rgba(255, 255, 255, 1)',
        }),
        backgroundFill: new Fill({
          color: 'rgba(0, 0, 0, 0.4)',
        }),
        padding: [2, 2, 2, 2],
        textAlign: 'left',
        offsetX: 15,
      }),
    });

    const source = new VectorSource();

    const vector = new VectorLayer({
      source: source,
      style: style
    });
    
    const raster = new TileLayer({
      source: new OSM(),
    });

    const styleFunction = (feature) =>  {
      const styles = [style];
      const geometry = feature.getGeometry();
      const type = geometry.getType();
      if (
        hintMsg.value &&
        type === 'Point'
      ) {
        hintStyle.getText().setText(hintMsg.value);
        styles.push(hintStyle);
      }
      return styles;
    }

    const draw = computed(() =>
      new Draw({
        source: source,
        type: measureType.value,
        style: styleFunction
      })
    )

    function addInteraction() {
      hintMsg.value = startDrawingMsg;
      draw.value.on('drawstart', () => {
        hintMsg.value = continueMsg.value;
      });
      draw.value.on('drawend', () => {
        hintMsg.value = startDrawingMsg
      })
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

      map.value.addInteraction(draw.value)
      addInteraction()
      watch(() => measureType.value, () => {
        console.log(measureType.value);
        map.value.removeInteraction(draw.value)
        map.value.addInteraction(draw.value)
        addInteraction()
      })

    })

  return { map, mapContainer, measureType, hintMsg, hintMsgContainer, showSegments, clearPrevious }
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