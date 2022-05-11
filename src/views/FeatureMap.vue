<template>
  <div id="map" class="map" ref="mapContainer"></div>
  <select id="actionType" v-model="actionType">
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
</template>

<script>
import { shallowRef, onMounted, markRaw, ref, watchEffect } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Draw, Modify, Select, Translate } from 'ol/interaction';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';

export default {
  setup() {
    const mapContainer = shallowRef(null);
    const map = shallowRef(null);
    const featureType = ref('Point')
    const actionType = ref('Draw')

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

    onMounted(() => {
      map.value = markRaw(new Map({
        layers: [ vectorLayer, newFeature ],
        target: 'map',
        view: new View({
          center: [-10738077.767669883, 4787398.742408488],
          zoom: 4.5,
        })
      }))

      map.value.addInteraction(select)

      function removeInteractions () {
        map.value.removeInteraction(drawPoint)
        map.value.removeInteraction(drawLineString)
        map.value.removeInteraction(drawPolygon)
        map.value.removeInteraction(drawCircle)
        map.value.removeInteraction(modify)
        map.value.removeInteraction(translate)
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
        } else {
          map.value.addInteraction(translate)
        }
      })
    })


  return { map, mapContainer, featureType, actionType }
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
}
</style>