<template>
  <div id="map" class="map" ref="mapContainer"></div>
  <div class="gridBox">
    <div class="gridLeft">
      <select id="actionType" v-model="actionType">
        <option value="Drag">Drag</option>
        <option value="Draw">Draw</option>
        <option value="Modify">Modify</option>
        <option value="Translate">Translate</option>
      </select>
      <select id="featureType" v-model="featureType" :disabled="actionType!=='Draw'">
        <option value="Point">Point</option>
        <option value="LineString">LineString</option>
        <option value="Polygon">Polygon</option>
        <option value="Circle">Circle</option>
      </select>
      <span v-if="actionType==='Draw'">
        <button @click="clearLastFeature" class="btn">Undo</button>
        <button @click="clearAllFeatures" class="btn">Clear All</button>
      </span>
    </div>
    <div class="gridRight">
      <ol class="instrutions" v-if="actionType==='Drag'">
        <li>Use <button class="keyBtn">Shift</button> +Drag to rotate.</li>
        <li>Use <button class="keyBtn">Alt</button> +Drag to draw/modify an extent.</li>
        <li>Use <button class="keyBtn">Shift</button> +<button class="keyBtn">Alt</button> +Drag to rotate and zoom. </li>
      </ol>
    </div>
  </div>

</template>

<script>
import { shallowRef, onMounted, markRaw, ref, watchEffect } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Draw, Modify, Select, Translate, Extent, DragRotateAndZoom, DragRotate, DragZoom, defaults as defaultsInteraction } from 'ol/interaction';
import { Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import { altKeyOnly, altShiftKeysOnly, shiftKeyOnly, doubleClick } from 'ol/events/condition';

export default {
  setup() {
    const mapContainer = shallowRef(null);
    const map = shallowRef(null);
    const featureType = ref('Point')
    const actionType = ref('Drag')

    const vectorLayer = new VectorLayer({
      background: 'white',
      source: new VectorSource({
        url: 'https://openlayers.org/data/vector/us-states.json',
        format: new GeoJSON(),
        wrapX: false,
      }),
    });

    const vectorStyle = {
      'Point': new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: '#ffcc33',
          }),
        })
      }),
      'LineString': new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 2
        })
      }),
      'Polygon': new Style({
        fill: new Fill({
          color: 'rgba(0, 153, 0, 0.3)'
        }),
        stroke: new Stroke({
          color: 'rgba(0, 153, 0,1)',
          width: 2
        }),
      }),
      'Circle': new Style({
        fill: new Fill({
          color: 'rgba(255, 128, 128,0.5)'
        }),
        stroke: new Stroke({
          color: 'rgba(255, 128, 128,1)',
          width: 2
        }),
      }),
    }

    const styleFunction = function (feature) {
      return vectorStyle[feature.getGeometry().getType()];
    };

    const newFeature = new VectorLayer({
      source: new VectorSource(),
      style: styleFunction,
    })

    const select = new Select({
      wrapX: false,
    });

    const translate = new Translate({
      features: select.getFeatures() 
    })

    const modify = new Modify({
      features: select.getFeatures(),
    });

    const drawPoint = new Draw({
      type: 'Point',
      source: newFeature.getSource()
    })
    const drawLineString = new Draw({
      type: 'LineString',
      source: newFeature.getSource()
    })
    const drawPolygon = new Draw({
      type: 'Polygon',
      source: newFeature.getSource()
    })
    const drawCircle = new Draw({
      type: 'Circle',
      source: newFeature.getSource(),
    })

    const addFeature = (e) => {
      const parser = new GeoJSON()
      parser.writeFeaturesObject([e.feature])
    }

    drawPoint.on('drawend', (e) => addFeature(e))
    drawLineString.on('drawend', (e) => addFeature(e))
    drawPolygon.on('drawend', (e) => addFeature(e))
    drawCircle.on('drawend', (e) => addFeature(e))

    const clearLastFeature = () => {
      const feature = newFeature.getSource().getFeatures().pop()
      newFeature.getSource().removeFeature(feature)
    }

    const clearAllFeatures = () => {
      newFeature.getSource().clear()
    }

    const extent = new Extent({
      condition: altKeyOnly,
      boxStyle: new Style({
        fill: new Fill({
          color: 'rgba(255, 204, 128, 0.3)'
        }),
        stroke: new Stroke({
          color: 'rgba(255, 204, 128, 0.8)',
          width: 2
        })
      }),
      pointerStyle: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: 'rgba(255, 204, 128, 1)',
          }),
        })
      })
    })

    const rotateAndZoom = new DragRotateAndZoom({
      condition: altShiftKeysOnly
    })

    const dragRotate = new DragRotate({
      condition: shiftKeyOnly
    })

    const dragZoom = new DragZoom({
      condition: doubleClick
    })

    onMounted(() => {
      map.value = markRaw(new Map({
        layers: [ vectorLayer, newFeature ],
        target: 'map',
        view: new View({
          center: [-10738077.767669883, 4787398.742408488],
          zoom: 4.5,
        }),
        keyboardEventTarget: document,
        interactions: defaultsInteraction({shiftDragZoom: false, dragPan: false})
      }))

      map.value.addInteraction(select)

      function removeInteractions () {
        map.value.removeInteraction(drawPoint)
        map.value.removeInteraction(drawLineString)
        map.value.removeInteraction(drawPolygon)
        map.value.removeInteraction(drawCircle)
        map.value.removeInteraction(modify)
        map.value.removeInteraction(translate)
        map.value.removeInteraction(extent)
        map.value.removeInteraction(rotateAndZoom)
        map.value.removeInteraction(dragRotate)
        map.value.removeInteraction(dragZoom)
      }

      watchEffect(() => {
        removeInteractions()
        if (actionType.value === 'Draw') {
          switch (featureType.value) {
            case 'Point':
              map.value.addInteraction(drawPoint);
              break;
            case 'LineString':
              map.value.addInteraction(drawLineString);
              break;
            case 'Polygon':
              map.value.addInteraction(drawPolygon);
              break;
            case 'Circle':
              map.value.addInteraction(drawCircle);
              break;
          }
        } else if (actionType.value === 'Modify') {
          map.value.addInteraction(modify)
        } else if (actionType.value === 'Translate') {
          map.value.addInteraction(translate)
        } else {
          map.value.addInteraction(extent)
          map.value.addInteraction(rotateAndZoom)
          map.value.addInteraction(dragRotate)
          map.value.addInteraction(dragZoom)
        }
      })
    })

  return { map, mapContainer, featureType, actionType, clearAllFeatures, clearLastFeature }
}
}
</script>

<style>
.map {
  width: 98%;
  height: 600px;
  margin: auto;
}

select {
  padding: 5px;
  margin: 10px;
  font-size: 20px;
  cursor: pointer;
}

.instrutions {
  text-align: start;
}

.keyBtn {
  background-color: #777;
  color: white;
  border-radius: 5px;
}

.gridBox {
  display: grid;
  grid-template-columns: 40vw 40vw;
}

.gridLeft {
  padding-left: 100px;
  text-align: start;
}

.btn {
  padding: 5px;
  margin: 5px;
  cursor: pointer;
  display: inline-block;
}

.btn:hover {
  transform: translateY(1px);
}
</style>